import { Types } from 'mongoose';
import {
	requireAdmin,
	requireAuthenticatedUser,
} from '@/common/backend/authorization.function';
import { connectToDatabase } from '@/common/database';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Leads } from '@/common/models/leads.schema';
import { Teams } from '@/common/models/teams.schema';
import { Users } from '@/common/models/users.schema';
import {
	createTeamInputSchema,
	getTeamPerformanceInputSchema,
	listTeamsInputSchema,
	type CreateTeamInput,
	type GetTeamPerformanceInput,
	type ListTeamsInput,
} from './manage-teams.input-schema';
import type { UserAccountStatus } from '@/users/backend/manage-users/manage-users.type';
import type {
	LeadStats,
	TeamMemberPerformance,
	TeamOverviewData,
	TeamOverviewItem,
	TeamPerformanceData,
} from './manage-teams.type';

type TeamDocument = {
	_id: Types.ObjectId;
	name: string;
	status?: string;
	created_at: Date;
};

type UserDocument = {
	_id: Types.ObjectId;
	name: string;
	email?: string;
	role: UserRole;
	status?: UserAccountStatus;
};

const MEMBER_ROLES = [UserRole.AGENT, UserRole.LOAN_OFFICER];

type LeadStatusAggregate = {
	_id: LeadStatus;
	count: number;
};

const emptyStats = (): LeadStats => ({
	total: 0,
	pending: 0,
	billable: 0,
	nonBillable: 0,
});

/**
 * Agents own the leads they create; loan officers own the leads assigned to
 * them. A team's leads are the union of both, which $or de-duplicates when the
 * same lead was created by one member and assigned to another.
 */
function createMemberLeadMatch(
	agentIds: Types.ObjectId[],
	loanOfficerIds: Types.ObjectId[],
) {
	return {
		$or: [
			{ created_by: { $in: agentIds } },
			{ loan_officer_id: { $in: loanOfficerIds } },
		],
	};
}

async function getLeadStatsForMembers(
	agentIds: Types.ObjectId[],
	loanOfficerIds: Types.ObjectId[],
): Promise<LeadStats> {
	if (agentIds.length === 0 && loanOfficerIds.length === 0) {
		return emptyStats();
	}

	const rows = await Leads.aggregate<LeadStatusAggregate>([
		{ $match: createMemberLeadMatch(agentIds, loanOfficerIds) },
		{ $group: { _id: '$status', count: { $sum: 1 } } },
	]);

	return rows.reduce((stats, row) => {
		stats.total += row.count;
		if (row._id === LeadStatus.PENDING) stats.pending = row.count;
		if (row._id === LeadStatus.BILLABLE) stats.billable = row.count;
		if (row._id === LeadStatus.NON_BILLABLE) stats.nonBillable = row.count;
		return stats;
	}, emptyStats());
}

function splitMemberIdsByRole(
	members: Array<Pick<UserDocument, '_id' | 'role'>>,
) {
	return {
		agentIds: members
			.filter((member) => member.role === UserRole.AGENT)
			.map((member) => member._id),
		loanOfficerIds: members
			.filter((member) => member.role === UserRole.LOAN_OFFICER)
			.map((member) => member._id),
	};
}

async function getTeamLeads(teamId: Types.ObjectId) {
	const teamLeads = await Users.find({
		team_id: teamId,
		role: UserRole.TEAM_LEAD,
	})
		.select('_id name')
		.sort({ name: 1 })
		.lean<Array<Pick<UserDocument, '_id' | 'name'>>>();

	return teamLeads.map((teamLead) => ({
		id: teamLead._id.toString(),
		name: teamLead.name,
	}));
}

async function buildTeamOverview(
	team: TeamDocument,
): Promise<TeamOverviewItem> {
	const [teamLeads, members] = await Promise.all([
		getTeamLeads(team._id),
		Users.find({
			team_id: team._id,
			role: { $in: MEMBER_ROLES },
		})
			.select('_id role')
			.lean<Array<Pick<UserDocument, '_id' | 'role'>>>(),
	]);

	const { agentIds, loanOfficerIds } = splitMemberIdsByRole(members);
	const stats = await getLeadStatsForMembers(agentIds, loanOfficerIds);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLeads,
		memberCount: members.length,
		agentCount: agentIds.length,
		loanOfficerCount: loanOfficerIds.length,
		stats,
		status: team.status || 'active',
		createdAt: team.created_at.toISOString(),
	};
}

export async function listTeams(
	input: ListTeamsInput = {},
): Promise<TeamOverviewData> {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.TEAM_LEAD
	) {
		throw new Error('Forbidden: Team management access denied');
	}
	if (currentUser.role === UserRole.TEAM_LEAD && !currentUser.teamId) {
		throw new Error('Team not found');
	}

	const validatedInput = listTeamsInputSchema.parse(input);
	const filter: Record<string, unknown> = {};
	const dateFilter: Record<string, Date> = {};

	if (validatedInput.search) {
		filter.name = new RegExp(validatedInput.search, 'i');
	}

	if (validatedInput.status !== 'all') {
		filter.status = validatedInput.status;
	}

	// Leadership now lives only on the user, so filtering by team lead means
	// resolving that lead's own team.
	if (
		currentUser.role === UserRole.ADMIN &&
		validatedInput.teamLeadId &&
		validatedInput.teamLeadId !== 'all' &&
		Types.ObjectId.isValid(validatedInput.teamLeadId)
	) {
		const selectedTeamLead = await Users.findOne({
			_id: new Types.ObjectId(validatedInput.teamLeadId),
			role: UserRole.TEAM_LEAD,
		})
			.select('team_id')
			.lean<{ team_id?: Types.ObjectId | null }>();

		filter._id = selectedTeamLead?.team_id ?? { $in: [] };
	}

	if (currentUser.role === UserRole.TEAM_LEAD) {
		filter._id = new Types.ObjectId(currentUser.teamId);
	}

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;
	if (Object.keys(dateFilter).length > 0) {
		filter.created_at = dateFilter;
	}

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const memberFilter =
		currentUser.role === UserRole.TEAM_LEAD
			? {
					role: { $in: MEMBER_ROLES },
					team_id: new Types.ObjectId(currentUser.teamId),
				}
			: {
					role: { $in: MEMBER_ROLES },
					team_id: { $exists: true, $ne: null },
				};
	const teamLeadFilter =
		currentUser.role === UserRole.TEAM_LEAD
			? { _id: new Types.ObjectId(currentUser.id) }
			: { role: UserRole.TEAM_LEAD };

	const [teams, total, allMembers, teamLeadUsers] = await Promise.all([
		Teams.find(filter)
			.select('_id name team_lead status created_at')
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(validatedInput.limit)
			.lean<TeamDocument[]>(),
		Teams.countDocuments(filter),
		Users.find(memberFilter)
			.select('_id role')
			.lean<Array<Pick<UserDocument, '_id' | 'role'>>>(),
		Users.find(teamLeadFilter)
			.select('_id name')
			.sort({ name: 1 })
			.lean<Array<Pick<UserDocument, '_id' | 'name'>>>(),
	]);

	const allMemberIds = splitMemberIdsByRole(allMembers);
	const [teamRows, stats] = await Promise.all([
		Promise.all(teams.map(buildTeamOverview)),
		getLeadStatsForMembers(allMemberIds.agentIds, allMemberIds.loanOfficerIds),
	]);

	return {
		teams: teamRows,
		stats,
		teamLeads: teamLeadUsers.map((teamLead) => ({
			id: teamLead._id.toString(),
			name: teamLead.name,
		})),
		total,
		page: validatedInput.page,
		limit: validatedInput.limit,
	};
}

export async function createTeam(input: CreateTeamInput) {
	await connectToDatabase();
	await requireAdmin();
	const validatedInput = createTeamInputSchema.parse(input);

	const teamLeadObjectIds = validatedInput.teamLeadIds.map((teamLeadId) => {
		if (!Types.ObjectId.isValid(teamLeadId)) {
			throw new Error('Team lead not found');
		}
		return new Types.ObjectId(teamLeadId);
	});

	const memberObjectIds = validatedInput.memberIds.map((memberId) => {
		if (!Types.ObjectId.isValid(memberId)) throw new Error('User not found');
		return new Types.ObjectId(memberId);
	});

	const teamLeadIdSet = new Set(
		teamLeadObjectIds.map((teamLeadId) => teamLeadId.toString()),
	);
	if (
		memberObjectIds.some((memberId) => teamLeadIdSet.has(memberId.toString()))
	) {
		throw new Error('A team lead cannot also be added as a team member');
	}

	const existingTeam = await Teams.findOne({
		name: validatedInput.name,
	}).lean();
	if (existingTeam) throw new Error('Team already exists');

	// A team may have several leads; each must be free of an existing team.
	const teamLeadCount = await Users.countDocuments({
		_id: { $in: teamLeadObjectIds },
		role: { $ne: UserRole.ADMIN },
		team_id: null,
	});
	if (teamLeadCount !== teamLeadObjectIds.length) {
		throw new Error('Team lead not found');
	}

	const memberCount = await Users.countDocuments({
		_id: { $in: memberObjectIds },
		role: { $in: MEMBER_ROLES },
		team_id: null,
	});
	if (memberCount !== memberObjectIds.length) {
		throw new Error('User not found');
	}

	const team = await Teams.create({
		name: validatedInput.name,
		status: 'active',
	});

	await Users.updateMany(
		{ _id: { $in: teamLeadObjectIds } },
		{ role: UserRole.TEAM_LEAD, team_id: team._id },
	);

	// Members keep their own role — a loan officer stays a loan officer.
	if (memberObjectIds.length > 0) {
		await Users.updateMany(
			{ _id: { $in: memberObjectIds } },
			{ team_id: team._id },
		);
	}

	return { id: team._id.toString() };
}

async function buildMemberPerformance(
	member: UserDocument,
): Promise<TeamMemberPerformance> {
	const isLoanOfficer = member.role === UserRole.LOAN_OFFICER;

	return {
		id: member._id.toString(),
		name: member.name,
		email: member.email,
		role: member.role,
		status: member.status || 'inactive',
		stats: await getLeadStatsForMembers(
			isLoanOfficer ? [] : [member._id],
			isLoanOfficer ? [member._id] : [],
		),
	};
}

export async function getTeamPerformance(
	input: GetTeamPerformanceInput,
): Promise<TeamPerformanceData> {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.TEAM_LEAD
	) {
		throw new Error('Forbidden: Team management access denied');
	}

	const validatedInput = getTeamPerformanceInputSchema.parse(input);

	if (!Types.ObjectId.isValid(validatedInput.id)) {
		throw new Error('Team not found');
	}

	const team = await Teams.findById(validatedInput.id)
		.select('_id name')
		.lean<TeamDocument>();
	if (!team) throw new Error('Team not found');
	if (
		currentUser.role === UserRole.TEAM_LEAD &&
		(!currentUser.teamId || team._id.toString() !== currentUser.teamId)
	) {
		throw new Error('Team not found');
	}

	const [teamLeads, members] = await Promise.all([
		getTeamLeads(team._id),
		Users.find({
			team_id: team._id,
			role: { $in: MEMBER_ROLES },
		})
			.select('_id name email role status')
			.sort({ name: 1 })
			.lean<UserDocument[]>(),
	]);

	const { agentIds, loanOfficerIds } = splitMemberIdsByRole(members);
	const [memberRows, stats] = await Promise.all([
		Promise.all(members.map(buildMemberPerformance)),
		getLeadStatsForMembers(agentIds, loanOfficerIds),
	]);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLeads,
		memberCount: members.length,
		agentCount: agentIds.length,
		loanOfficerCount: loanOfficerIds.length,
		stats,
		members: memberRows,
	};
}
