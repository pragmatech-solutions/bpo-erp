import { Types, type PipelineStage } from 'mongoose';

import {
	getTeamMemberIds,
	type TeamMemberIds,
} from '@/common/backend/get-team-member-ids.function';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';

import { listReportInputSchema } from './list-report.input-schema';
import type {
	ListReportInput,
	ListReportResult,
	ReportRow,
} from './list-report.type';

const REPORT_CREATOR_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
];

function addAndCondition(
	matchStage: Record<string, unknown>,
	condition: Record<string, unknown>,
) {
	const existingConditions = matchStage.$and;

	if (Array.isArray(existingConditions)) {
		existingConditions.push(condition);
		return;
	}

	matchStage.$and = [condition];
}

function createReportTeamMatch({
	leadCreatorIds,
}: TeamMemberIds): Record<string, unknown> {
	return { created_by: { $in: leadCreatorIds } };
}

function createReportUserMatch(
	user: { role: UserRole } | null,
	userId: Types.ObjectId,
): Record<string, unknown> {
	return user && REPORT_CREATOR_ROLES.includes(user.role)
		? { created_by: userId }
		: { created_by: { $in: [] } };
}

async function buildReportMatchStage(input: ListReportInput): Promise<{
	matchStage: Record<string, unknown>;
	canViewPaymentStatus: boolean;
}> {
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const validatedInput = listReportInputSchema.parse(input);
	const matchStage: Record<string, unknown> = {};
	const dateFilter: Record<string, Date> = {};
	const isAdmin = currentUser.role === UserRole.ADMIN;
	const canViewPaymentStatus =
		currentUser.role === UserRole.ADMIN ||
		currentUser.role === UserRole.MANAGER;

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;

	if (isAdmin) {
		if (validatedInput.deletedFilter === 'active') {
			matchStage.deleted_at = { $exists: false };
		} else if (validatedInput.deletedFilter === 'deleted') {
			matchStage.deleted_at = { $exists: true };
		}
	} else {
		matchStage.deleted_at = { $exists: false };
	}

	if (isAdmin) {
		const requestedAgentId = validatedInput.agentId;
		const requestedTeamId = validatedInput.teamId;
		let teamMemberIds: TeamMemberIds | undefined;

		if (
			requestedTeamId &&
			requestedTeamId !== 'All Teams' &&
			Types.ObjectId.isValid(requestedTeamId)
		) {
			teamMemberIds = await getTeamMemberIds(requestedTeamId);
		}

		if (
			requestedAgentId &&
			requestedAgentId !== 'All Agents' &&
			Types.ObjectId.isValid(requestedAgentId)
		) {
			const agentObjectId = new Types.ObjectId(requestedAgentId);
			const agentMatchesTeam = teamMemberIds
				? [
						...teamMemberIds.leadCreatorIds,
						...teamMemberIds.loanOfficerIds,
					].some((memberId) => memberId.toString() === agentObjectId.toString())
				: true;

			if (!agentMatchesTeam) {
				matchStage.created_by = { $in: [] };
			} else {
				const targetUser = await Users.findById(agentObjectId)
					.select('role')
					.lean<{ role: UserRole } | null>();

				matchStage.$and = [createReportUserMatch(targetUser, agentObjectId)];
			}
		} else if (teamMemberIds) {
			matchStage.$and = [createReportTeamMatch(teamMemberIds)];
		}
	} else if (
		currentUser.role === UserRole.TEAM_LEAD ||
		currentUser.role === UserRole.MANAGER
	) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team-scoped user is not assigned to a team');
		}

		const requestedMemberId =
			validatedInput.agentId && validatedInput.agentId !== 'All Agents'
				? validatedInput.agentId
				: undefined;

		const teamMemberIds = await getTeamMemberIds(currentUser.teamId);
		let teamMatch = createReportTeamMatch(teamMemberIds);

		if (requestedMemberId && Types.ObjectId.isValid(requestedMemberId)) {
			const requestedObjectId = new Types.ObjectId(requestedMemberId);
			const selectedCreatorId = teamMemberIds.leadCreatorIds.find(
				(creatorId) => creatorId.toString() === requestedObjectId.toString(),
			);

			teamMatch = selectedCreatorId
				? { created_by: selectedCreatorId }
				: { created_by: { $in: [] } };
		}

		matchStage.$and = [teamMatch];
	} else if (currentUser.role === UserRole.AGENT) {
		matchStage.created_by = new Types.ObjectId(currentUser.id);
	} else {
		throw new Error('Forbidden');
	}

	if (validatedInput.status) matchStage.status = validatedInput.status;

	if (canViewPaymentStatus && validatedInput.paymentStatus) {
		matchStage.payment_status = validatedInput.paymentStatus;
	}

	if (validatedInput.campaign) matchStage.campaign = validatedInput.campaign;

	if (validatedInput.leadType === 'call_transfer') {
		matchStage.lead_type = 'call_transfer';
	} else if (validatedInput.leadType === 'standard') {
		addAndCondition(matchStage, {
			$or: [
				{ lead_type: 'standard' },
				{ lead_type: { $exists: false } },
				{ lead_type: null },
			],
		});
	}

	if (validatedInput.search) {
		const searchRegex = new RegExp(validatedInput.search, 'i');
		matchStage.$or = [
			{ customer_name: { $regex: searchRegex } },
			{ customer_number: { $regex: searchRegex } },
			{ username: { $regex: searchRegex } },
		];
	}

	if (Object.keys(dateFilter).length > 0) {
		matchStage.created_at = dateFilter;
	}

	return { matchStage, canViewPaymentStatus };
}

export async function listReport(
	input: ListReportInput = {},
): Promise<ListReportResult> {
	await connectToDatabase();

	const validatedInput = listReportInputSchema.parse(input);
	const { matchStage } = await buildReportMatchStage(validatedInput);
	const skip = (validatedInput.page - 1) * validatedInput.limit;

	const pipeline: PipelineStage[] = [
		{ $match: matchStage },
		{
			$group: {
				_id: '$created_by',
				totalLeads: { $sum: 1 },
				nonBillable: {
					$sum: {
						$cond: [{ $eq: ['$status', LeadStatus.NON_BILLABLE] }, 1, 0],
					},
				},
				billable: {
					$sum: { $cond: [{ $eq: ['$status', LeadStatus.BILLABLE] }, 1, 0] },
				},
			},
		},
		{
			$lookup: {
				from: 'users',
				localField: '_id',
				foreignField: '_id',
				as: 'user',
			},
		},
		{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				_id: 0,
				userName: { $ifNull: ['$user.name', 'Unknown'] },
				user: {
					id: { $ifNull: [{ $toString: '$user._id' }, { $toString: '$_id' }] },
					name: { $ifNull: ['$user.name', 'Unknown'] },
				},
				totalLeads: 1,
				nonBillable: 1,
				billable: 1,
			},
		},
		{ $sort: { userName: 1 } },
		{
			$facet: {
				rows: [{ $skip: skip }, { $limit: validatedInput.limit }],
				totalRows: [{ $count: 'total' }],
			},
		},
	];

	const [result] = await Leads.aggregate<{
		rows: ReportRow[];
		totalRows: Array<{ total: number }>;
	}>(pipeline);

	return {
		rows: result?.rows || [],
		total: result?.totalRows[0]?.total || 0,
		page: validatedInput.page,
		limit: validatedInput.limit,
	};
}
