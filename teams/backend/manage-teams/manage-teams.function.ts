import { Types } from 'mongoose';
import { requireAdmin } from '@/common/backend/authorization.function';
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
	team_lead?: Types.ObjectId | null;
	status?: string;
	created_at: Date;
};

type UserDocument = {
	_id: Types.ObjectId;
	name: string;
	email: string;
};

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

async function getLeadStatsForUsers(userIds: Types.ObjectId[]): Promise<LeadStats> {
	if (userIds.length === 0) return emptyStats();

	const rows = await Leads.aggregate<LeadStatusAggregate>([
		{ $match: { created_by: { $in: userIds } } },
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

async function getTeamLead(teamLeadId?: Types.ObjectId | null) {
	if (!teamLeadId) return null;

	const teamLead = await Users.findById(teamLeadId)
		.select('_id name')
		.lean<Pick<UserDocument, '_id' | 'name'>>();

	if (!teamLead) return null;

	return {
		id: teamLead._id.toString(),
		name: teamLead.name,
	};
}

async function buildTeamOverview(team: TeamDocument): Promise<TeamOverviewItem> {
	const [teamLead, members] = await Promise.all([
		getTeamLead(team.team_lead),
		Users.find({
			team_id: team._id,
			role: UserRole.AGENT,
		})
			.select('_id')
			.lean<Array<Pick<UserDocument, '_id'>>>(),
	]);

	const memberIds = members.map((member) => member._id);
	const stats = await getLeadStatsForUsers(memberIds);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLead,
		memberCount: members.length,
		stats,
		status: team.status || 'active',
		createdAt: team.created_at.toISOString(),
	};
}

export async function listTeams(
	input: ListTeamsInput = {},
): Promise<TeamOverviewData> {
	await connectToDatabase();
	await requireAdmin();
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
		validatedInput.teamLeadId &&
		validatedInput.teamLeadId !== 'all' &&
		Types.ObjectId.isValid(validatedInput.teamLeadId)
	) {
		filter.team_lead = new Types.ObjectId(validatedInput.teamLeadId);
	}

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;
	if (Object.keys(dateFilter).length > 0) {
		filter.created_at = dateFilter;
	}

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const [teams, total, allAgents, teamLeadUsers] = await Promise.all([
		Teams.find(filter)
			.select('_id name team_lead status created_at')
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(validatedInput.limit)
			.lean<TeamDocument[]>(),
		Teams.countDocuments(filter),
		Users.find({
			role: UserRole.AGENT,
			team_id: { $exists: true, $ne: null },
		})
			.select('_id')
			.lean<Array<Pick<UserDocument, '_id'>>>(),
		Users.find({ role: UserRole.TEAM_LEAD })
			.select('_id name')
			.sort({ name: 1 })
			.lean<Array<Pick<UserDocument, '_id' | 'name'>>>(),
	]);

	const [teamRows, stats] = await Promise.all([
		Promise.all(teams.map(buildTeamOverview)),
		getLeadStatsForUsers(allAgents.map((agent) => agent._id)),
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

	if (!Types.ObjectId.isValid(validatedInput.teamLeadId)) {
		throw new Error('Team lead not found');
	}

	const memberObjectIds = validatedInput.memberIds.map((memberId) => {
		if (!Types.ObjectId.isValid(memberId)) throw new Error('User not found');
		return new Types.ObjectId(memberId);
	});

	const existingTeam = await Teams.findOne({ name: validatedInput.name }).lean();
	if (existingTeam) throw new Error('Team already exists');

	const teamLead = await Users.findById(validatedInput.teamLeadId).lean<{
		_id: Types.ObjectId;
		role: UserRole;
	}>();
	if (!teamLead || teamLead.role === UserRole.ADMIN) {
		throw new Error('Team lead not found');
	}

	const memberCount = await Users.countDocuments({
		_id: { $in: memberObjectIds },
		role: { $ne: UserRole.ADMIN },
	});
	if (memberCount !== memberObjectIds.length) {
		throw new Error('User not found');
	}

	const team = await Teams.create({
		name: validatedInput.name,
		team_lead: teamLead._id,
		status: 'active',
	});

	await Users.findByIdAndUpdate(teamLead._id, {
		role: UserRole.TEAM_LEAD,
		team_id: team._id,
	});

	if (memberObjectIds.length > 0) {
		await Users.updateMany(
			{ _id: { $in: memberObjectIds } },
			{ role: UserRole.AGENT, team_id: team._id },
		);
	}

	return { id: team._id.toString() };
}

async function buildMemberPerformance(
	member: UserDocument,
): Promise<TeamMemberPerformance> {
	return {
		id: member._id.toString(),
		name: member.name,
		email: member.email,
		stats: await getLeadStatsForUsers([member._id]),
	};
}

export async function getTeamPerformance(
	input: GetTeamPerformanceInput,
): Promise<TeamPerformanceData> {
	await connectToDatabase();
	await requireAdmin();
	const validatedInput = getTeamPerformanceInputSchema.parse(input);

	if (!Types.ObjectId.isValid(validatedInput.id)) {
		throw new Error('Team not found');
	}

	const team = await Teams.findById(validatedInput.id)
		.select('_id name team_lead')
		.lean<TeamDocument>();
	if (!team) throw new Error('Team not found');

	const [teamLead, members] = await Promise.all([
		getTeamLead(team.team_lead),
		Users.find({
			team_id: team._id,
			role: UserRole.AGENT,
		})
			.select('_id name email')
			.sort({ name: 1 })
			.lean<UserDocument[]>(),
	]);

	const [memberRows, stats] = await Promise.all([
		Promise.all(members.map(buildMemberPerformance)),
		getLeadStatsForUsers(members.map((member) => member._id)),
	]);

	return {
		id: team._id.toString(),
		name: team.name,
		teamLead,
		memberCount: members.length,
		stats,
		members: memberRows,
	};
}
