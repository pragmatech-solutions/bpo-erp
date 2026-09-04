import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Leads } from '@/common/models/leads.schema';
import { Teams } from '@/common/models/teams.schema';
import { Users } from '@/common/models/users.schema';
import listLeads from '@/leads/backend/list-leads';
import {
	getTeamDashboardInputSchema,
	type GetTeamDashboardInput,
} from './get-team-dashboard.input-schema';
import type {
	TeamDashboardData,
	TeamMemberDashboardItem,
} from './get-team-dashboard.type';
type TeamMemberDocument = {
	_id: Types.ObjectId;
	name: string;
	email?: string;
	status?: 'active' | 'inactive' | 'blocked';
	role: UserRole;
};
const TEAM_LEAD_CREATOR_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
];
const TEAM_SCOPED_ROLES = [...TEAM_LEAD_CREATOR_ROLES, UserRole.LOAN_OFFICER];
type TeamDocument = {
	_id: Types.ObjectId;
	name: string;
};
type MemberStatsRow = {
	_id: Types.ObjectId;
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
	campaigns: string[];
};
function createLeadMatch(
	ownerField: 'created_by' | 'loan_officer_id',
	memberIds: Types.ObjectId[],
	input: GetTeamDashboardInput,
): Record<string, unknown> {
	const matchStage: Record<string, unknown> = {
		[ownerField]: { $in: memberIds },
	};
	const dateFilter: Record<string, Date> = {};
	if (input.startDate) dateFilter.$gte = input.startDate;
	if (input.endDate) dateFilter.$lte = input.endDate;
	if (Object.keys(dateFilter).length > 0) matchStage.updated_at = dateFilter;
	if (input.status) matchStage.status = input.status;
	if (input.paymentStatus) matchStage.payment_status = input.paymentStatus;
	if (input.campaign) matchStage.campaign = input.campaign;
	if (input.search) {
		const searchRegex = new RegExp(input.search, 'i');
		matchStage.$or = [
			{ customer_name: { $regex: searchRegex } },
			{ customer_number: { $regex: searchRegex } },
			{ username: { $regex: searchRegex } },
		];
	}
	return matchStage;
}
function getEmptyAnalytics() {
	return { total: 0, pending: 0, billable: 0, nonBillable: 0 };
}
function createStatsGroupStage(ownerField: 'created_by' | 'loan_officer_id') {
	return {
		$group: {
			_id: `$${ownerField}`,
			total: { $sum: 1 },
			pending: {
				$sum: { $cond: [{ $eq: ['$status', LeadStatus.PENDING] }, 1, 0] },
			},
			billable: {
				$sum: { $cond: [{ $eq: ['$status', LeadStatus.BILLABLE] }, 1, 0] },
			},
			nonBillable: {
				$sum: {
					$cond: [{ $eq: ['$status', LeadStatus.NON_BILLABLE] }, 1, 0],
				},
			},
			campaigns: { $addToSet: '$campaign' },
		},
	};
}
async function aggregateMemberStats(
	members: TeamMemberDocument[],
	input: GetTeamDashboardInput,
): Promise<MemberStatsRow[]> {
	const leadCreatorIds = members
		.filter((member) => TEAM_LEAD_CREATOR_ROLES.includes(member.role))
		.map((member) => member._id);
	const loanOfficerIds = members
		.filter((member) => member.role === UserRole.LOAN_OFFICER)
		.map((member) => member._id);
	const [agentRows, loanOfficerRows] = await Promise.all([
		leadCreatorIds.length > 0
			? Leads.aggregate<MemberStatsRow>([
					{ $match: createLeadMatch('created_by', leadCreatorIds, input) },
					createStatsGroupStage('created_by'),
				])
			: Promise.resolve([]),
		loanOfficerIds.length > 0
			? Leads.aggregate<MemberStatsRow>([
					{ $match: createLeadMatch('loan_officer_id', loanOfficerIds, input) },
					createStatsGroupStage('loan_officer_id'),
				])
			: Promise.resolve([]),
	]);
	return [...agentRows, ...loanOfficerRows];
}
export async function getTeamDashboard(
	input: GetTeamDashboardInput = {},
): Promise<TeamDashboardData> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (
		currentUser.role !== UserRole.TEAM_LEAD &&
		currentUser.role !== UserRole.MANAGER
	) {
		throw new Error('Forbidden: Team lead or manager access only');
	}
	if (!currentUser.teamId) {
		throw new Error('Forbidden: Team-scoped user is not assigned to a team');
	}
	const validatedInput = getTeamDashboardInputSchema.parse(input);
	const teamObjectId = new Types.ObjectId(currentUser.teamId);
	const team = await Teams.findById(teamObjectId)
		.select('_id name')
		.lean<TeamDocument>();
	if (!team) throw new Error('Team not found');
	const teamMembers = await Users.find({
		role: { $in: TEAM_SCOPED_ROLES },
		team_id: teamObjectId,
	})
		.select('_id name email role status')
		.sort({ name: 1 })
		.lean<TeamMemberDocument[]>();
	const selectedMember = teamMembers.find(
		(member) => member._id.toString() === validatedInput.agentId,
	);
	const displayedMembers = validatedInput.agentId
		? selectedMember
			? [selectedMember]
			: []
		: teamMembers;
	// Agents are measured by the leads they create, loan officers by the leads
	// assigned to them, so each role needs its own grouping key.
	const statsRows = await aggregateMemberStats(
		displayedMembers,
		validatedInput,
	);
	const statsByMemberId = new Map(
		statsRows.map((row) => [row._id.toString(), row]),
	);
	const members: TeamMemberDashboardItem[] = displayedMembers.map((member) => {
		const stats = statsByMemberId.get(member._id.toString());
		return {
			id: member._id.toString(),
			name: member.name,
			email: member.email,
			role: member.role,
			status: member.status,
			analytics: stats
				? {
						total: stats.total,
						pending: stats.pending,
						billable: stats.billable,
						nonBillable: stats.nonBillable,
					}
				: getEmptyAnalytics(),
			campaigns: stats?.campaigns.filter(Boolean).sort() || [],
		};
	});
	const analytics = statsRows.reduce(
		(totals, row) => ({
			total: totals.total + row.total,
			pending: totals.pending + row.pending,
			billable: totals.billable + row.billable,
			nonBillable: totals.nonBillable + row.nonBillable,
		}),
		getEmptyAnalytics(),
	);
	const memberObjectIds = teamMembers.map((member) => member._id);
	const creatorIds = teamMembers
		.filter((member) => TEAM_LEAD_CREATOR_ROLES.includes(member.role))
		.map((member) => member._id);
	const campaigns = await Leads.distinct('campaign', {
		$or: [
			{ created_by: { $in: creatorIds } },
			{ loan_officer_id: { $in: memberObjectIds } },
		],
	});
	const { leads } = await listLeads(validatedInput);
	return {
		team: { id: team._id.toString(), name: team.name },
		analytics,
		members,
		campaigns: campaigns.filter(Boolean).sort(),
		leads,
	};
}
