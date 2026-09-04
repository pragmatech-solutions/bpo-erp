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
const TEAM_LEADERSHIP_ROLES = [UserRole.TEAM_LEAD, UserRole.MANAGER];
const TEAM_LEAD_CREATOR_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
];
const TEAM_SCOPED_ROLES = [...TEAM_LEAD_CREATOR_ROLES, UserRole.LOAN_OFFICER];

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
 * Team leads, managers, and agents own the leads they create. Loan officers own
 * the leads assigned to them. A team's leads are the union of both sides.
 */
function createMemberLeadMatch(
	leadCreatorIds: Types.ObjectId[],
	loanOfficerIds: Types.ObjectId[],
) {
	return {
		$or: [
			{ created_by: { $in: leadCreatorIds } },
			{ loan_officer_id: { $in: loanOfficerIds } },
		],
	};
}

async function getLeadStatsForMembers(
	leadCreatorIds: Types.ObjectId[],
	loanOfficerIds: Types.ObjectId[],
): Promise<LeadStats> {
	if (leadCreatorIds.length === 0 && loanOfficerIds.length === 0) {
		return emptyStats();
	}

	const rows = await Leads.aggregate<LeadStatusAggregate>([
		{ $match: createMemberLeadMatch(leadCreatorIds, loanOfficerIds) },
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
		leadCreatorIds: members
			.filter((member) => TEAM_LEAD_CREATOR_ROLES.includes(member.role))
			.map((member) => member._id),
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

async function getManagers(teamId: Types.ObjectId) {
	const managers = await Users.find({
		team_id: teamId,
		role: UserRole.MANAGER,
	})
		.select('_id name')
		.sort({ name: 1 })
		.lean<Array<Pick<UserDocument, '_id' | 'name'>>>();

	return managers.map((manager) => ({
		id: manager._id.toString(),
		name: manager.name,
	}));
}

async function buildTeamOverview(
	team: TeamDocument,
): Promise<TeamOverviewItem> {
	const [teamLeads, managers, teamUsers] = await Promise.all([
		getTeamLeads(team._id),
		getManagers(team._id),
		Users.find({
			team_id: team._id,
			role: { $in: TEAM_SCOPED_ROLES },
		})
			.select('_id role')
			.lean<Array<Pick<UserDocument, '_id' | 'role'>>>(),
	]);

	const members = teamUsers.filter((member) =>
		MEMBER_ROLES.includes(member.role),
	);
	const { leadCreatorIds, agentIds, loanOfficerIds } =
		splitMemberIdsByRole(teamUsers);
	const stats = await getLeadStatsForMembers(leadCreatorIds, loanOfficerIds);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLeads,
		managers,
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
		currentUser.role !== UserRole.MANAGER &&
		currentUser.role !== UserRole.TEAM_LEAD
	) {
		throw new Error('Forbidden: Team management access denied');
	}
	if (TEAM_LEADERSHIP_ROLES.includes(currentUser.role) && !currentUser.teamId) {
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

	if (TEAM_LEADERSHIP_ROLES.includes(currentUser.role)) {
		filter._id = new Types.ObjectId(currentUser.teamId);
	}

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;
	if (Object.keys(dateFilter).length > 0) {
		filter.created_at = dateFilter;
	}

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const teamUserFilter = TEAM_LEADERSHIP_ROLES.includes(currentUser.role)
		? {
				role: { $in: TEAM_SCOPED_ROLES },
				team_id: new Types.ObjectId(currentUser.teamId),
			}
		: {
				role: { $in: TEAM_SCOPED_ROLES },
				team_id: { $exists: true, $ne: null },
			};
	const teamLeadFilter =
		currentUser.role === UserRole.TEAM_LEAD
			? { _id: new Types.ObjectId(currentUser.id) }
			: TEAM_LEADERSHIP_ROLES.includes(currentUser.role)
				? {
						role: UserRole.TEAM_LEAD,
						team_id: new Types.ObjectId(currentUser.teamId),
					}
				: { role: UserRole.TEAM_LEAD };
	const managerFilter =
		currentUser.role === UserRole.MANAGER
			? { _id: new Types.ObjectId(currentUser.id) }
			: TEAM_LEADERSHIP_ROLES.includes(currentUser.role)
				? {
						role: UserRole.MANAGER,
						team_id: new Types.ObjectId(currentUser.teamId),
					}
				: { role: UserRole.MANAGER };

	const [teams, total, allTeamUsers, teamLeadUsers, managerUsers] =
		await Promise.all([
			Teams.find(filter)
				.select('_id name team_lead status created_at')
				.sort({ created_at: -1 })
				.skip(skip)
				.limit(validatedInput.limit)
				.lean<TeamDocument[]>(),
			Teams.countDocuments(filter),
			Users.find(teamUserFilter)
				.select('_id role')
				.lean<Array<Pick<UserDocument, '_id' | 'role'>>>(),
			Users.find(teamLeadFilter)
				.select('_id name')
				.sort({ name: 1 })
				.lean<Array<Pick<UserDocument, '_id' | 'name'>>>(),
			Users.find(managerFilter)
				.select('_id name')
				.sort({ name: 1 })
				.lean<Array<Pick<UserDocument, '_id' | 'name'>>>(),
		]);

	const allMemberIds = splitMemberIdsByRole(allTeamUsers);
	const [teamRows, stats] = await Promise.all([
		Promise.all(teams.map(buildTeamOverview)),
		getLeadStatsForMembers(
			allMemberIds.leadCreatorIds,
			allMemberIds.loanOfficerIds,
		),
	]);

	return {
		teams: teamRows,
		stats,
		teamLeads: teamLeadUsers.map((teamLead) => ({
			id: teamLead._id.toString(),
			name: teamLead.name,
		})),
		managers: managerUsers.map((manager) => ({
			id: manager._id.toString(),
			name: manager.name,
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

	const managerObjectIds = validatedInput.managerIds.map((managerId) => {
		if (!Types.ObjectId.isValid(managerId)) {
			throw new Error('Manager not found');
		}
		return new Types.ObjectId(managerId);
	});

	const memberObjectIds = validatedInput.memberIds.map((memberId) => {
		if (!Types.ObjectId.isValid(memberId)) throw new Error('User not found');
		return new Types.ObjectId(memberId);
	});

	const leadershipIdSet = new Set(
		[...teamLeadObjectIds, ...managerObjectIds].map((leaderId) =>
			leaderId.toString(),
		),
	);
	if (
		memberObjectIds.some((memberId) => leadershipIdSet.has(memberId.toString()))
	) {
		throw new Error('A team leader cannot also be added as a team member');
	}

	const existingTeam = await Teams.findOne({
		name: validatedInput.name,
	}).lean();
	if (existingTeam) throw new Error('Team already exists');

	const teamLeadCount = await Users.countDocuments({
		_id: { $in: teamLeadObjectIds },
		role: UserRole.TEAM_LEAD,
		team_id: null,
	});
	if (teamLeadCount !== teamLeadObjectIds.length) {
		throw new Error('Team lead not found');
	}

	const managerCount = await Users.countDocuments({
		_id: { $in: managerObjectIds },
		role: UserRole.MANAGER,
		team_id: null,
	});
	if (managerCount !== managerObjectIds.length) {
		throw new Error('Manager not found');
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

	if (managerObjectIds.length > 0) {
		await Users.updateMany(
			{ _id: { $in: managerObjectIds } },
			{ role: UserRole.MANAGER, team_id: team._id },
		);
	}

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
		currentUser.role !== UserRole.MANAGER &&
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
		TEAM_LEADERSHIP_ROLES.includes(currentUser.role) &&
		(!currentUser.teamId || team._id.toString() !== currentUser.teamId)
	) {
		throw new Error('Team not found');
	}

	const [teamLeads, managers, members, teamUsers] = await Promise.all([
		getTeamLeads(team._id),
		getManagers(team._id),
		Users.find({
			team_id: team._id,
			role: { $in: MEMBER_ROLES },
		})
			.select('_id name email role status')
			.sort({ name: 1 })
			.lean<UserDocument[]>(),
		Users.find({
			team_id: team._id,
			role: { $in: TEAM_SCOPED_ROLES },
		})
			.select('_id role')
			.lean<Array<Pick<UserDocument, '_id' | 'role'>>>(),
	]);

	const { leadCreatorIds, agentIds, loanOfficerIds } =
		splitMemberIdsByRole(teamUsers);
	const [memberRows, stats] = await Promise.all([
		Promise.all(members.map(buildMemberPerformance)),
		getLeadStatsForMembers(leadCreatorIds, loanOfficerIds),
	]);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLeads,
		managers,
		memberCount: members.length,
		agentCount: agentIds.length,
		loanOfficerCount: loanOfficerIds.length,
		stats,
		members: memberRows,
	};
}
