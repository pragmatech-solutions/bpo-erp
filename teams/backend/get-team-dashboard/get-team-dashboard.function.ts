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

type TeamAgentDocument = {
	_id: Types.ObjectId;
	name: string;
	email?: string;
};

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
	agentIds: Types.ObjectId[],
	input: GetTeamDashboardInput,
): Record<string, unknown> {
	const matchStage: Record<string, unknown> = { created_by: { $in: agentIds } };
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

export async function getTeamDashboard(
	input: GetTeamDashboardInput = {},
): Promise<TeamDashboardData> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (currentUser.role !== UserRole.TEAM_LEAD) {
		throw new Error('Forbidden: Team lead access only');
	}
	if (!currentUser.teamId) {
		throw new Error('Forbidden: Team lead is not assigned to a team');
	}

	const validatedInput = getTeamDashboardInputSchema.parse(input);
	const teamObjectId = new Types.ObjectId(currentUser.teamId);
	const team = await Teams.findById(teamObjectId)
		.select('_id name')
		.lean<TeamDocument>();
	if (!team) throw new Error('Team not found');

	const agents = await Users.find({
		role: UserRole.AGENT,
		status: 'active',
		team_id: teamObjectId,
	})
		.select('_id name email')
		.sort({ name: 1 })
		.lean<TeamAgentDocument[]>();

	const selectedAgent = agents.find(
		(agent) => agent._id.toString() === validatedInput.agentId,
	);
	const displayedAgents = validatedInput.agentId
		? selectedAgent
			? [selectedAgent]
			: []
		: agents;
	const displayedAgentIds = displayedAgents.map((agent) => agent._id);
	const leadMatch = createLeadMatch(displayedAgentIds, validatedInput);

	const statsRows = await Leads.aggregate<MemberStatsRow>([
		{ $match: leadMatch },
		{
			$group: {
				_id: '$created_by',
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
		},
	]);

	const statsByAgentId = new Map(
		statsRows.map((row) => [row._id.toString(), row]),
	);
	const members: TeamMemberDashboardItem[] = displayedAgents.map((agent) => {
		const stats = statsByAgentId.get(agent._id.toString());
		return {
			id: agent._id.toString(),
			name: agent.name,
			email: agent.email,
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

	const analytics = members.reduce(
		(totals, member) => ({
			total: totals.total + member.analytics.total,
			pending: totals.pending + member.analytics.pending,
			billable: totals.billable + member.analytics.billable,
			nonBillable: totals.nonBillable + member.analytics.nonBillable,
		}),
		getEmptyAnalytics(),
	);

	const campaigns = await Leads.distinct('campaign', {
		created_by: { $in: agents.map((agent) => agent._id) },
	});
	const leads = await listLeads(validatedInput);

	return {
		team: { id: team._id.toString(), name: team.name },
		analytics,
		members,
		campaigns: campaigns.filter(Boolean).sort(),
		leads,
	};
}
