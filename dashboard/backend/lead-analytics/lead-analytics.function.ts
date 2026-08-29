import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import {
	buildTeamLeadLeadMatch,
	createTeamMemberLeadMatch,
	getTeamMemberIds,
	type TeamMemberIds,
} from '@/common/backend/get-team-member-ids.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { listLeadsInputSchema } from '@/leads/backend/list-leads/list-leads.input-schema';
import type { ListLeadsInput } from '@/leads/backend/list-leads/list-leads.type';
import type { DashboardData } from './lead-analytics.type';

async function buildDashboardMatchStage(
	input: ListLeadsInput,
): Promise<Record<string, unknown>> {
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');

	const validatedInput = listLeadsInputSchema.parse(input);
	const matchStage: Record<string, unknown> = {};
	const dateFilter: Record<string, Date> = {};
	const isAdmin = currentUser.role === UserRole.ADMIN;
	const canViewPaymentStatus =
		currentUser.role === UserRole.ADMIN ||
		currentUser.role === UserRole.TEAM_LEAD;

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
		const requestedMemberId = validatedInput.agentId;
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
			requestedMemberId &&
			requestedMemberId !== 'All Agents' &&
			Types.ObjectId.isValid(requestedMemberId)
		) {
			const memberObjectId = new Types.ObjectId(requestedMemberId);
			const memberMatchesTeam = teamMemberIds
				? [...teamMemberIds.agentIds, ...teamMemberIds.loanOfficerIds].some(
						(memberId) => memberId.toString() === memberObjectId.toString(),
					)
				: true;

			if (!memberMatchesTeam) {
				matchStage.created_by = { $in: [] };
			} else {
				const targetUser = await Users.findById(memberObjectId)
					.select('role')
					.lean<{ role: UserRole }>();

				matchStage.$and = [
					targetUser?.role === UserRole.LOAN_OFFICER
						? { loan_officer_id: memberObjectId }
						: { created_by: memberObjectId },
				];
			}
		} else if (teamMemberIds) {
			matchStage.$and = [createTeamMemberLeadMatch(teamMemberIds)];
		}
	} else if (currentUser.role === UserRole.TEAM_LEAD) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team lead is not assigned to a team');
		}

		const requestedMemberId =
			validatedInput.agentId && validatedInput.agentId !== 'All Agents'
				? validatedInput.agentId
				: undefined;
		const teamMatch = await buildTeamLeadLeadMatch(
			currentUser.teamId,
			requestedMemberId,
		);

		if (!requestedMemberId) {
			const teamLeadId = new Types.ObjectId(currentUser.id);
			(teamMatch.$or as Record<string, unknown>[]).push({
				created_by: teamLeadId,
			});
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
	if (Object.keys(dateFilter).length > 0) matchStage.updated_at = dateFilter;

	return matchStage;
}

export async function getLeadAnalytics(
	input: ListLeadsInput = {},
): Promise<DashboardData> {
	await connectToDatabase();
	const matchStage = await buildDashboardMatchStage(input);

	const analyticsRows = await Leads.aggregate([
		{ $match: matchStage },
		{
			$group: {
				_id: null,
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
			},
		},
	]);

	const analytics = analyticsRows[0] || {
		total: 0,
		pending: 0,
		billable: 0,
		nonBillable: 0,
	};

	return {
		analytics: {
			total: analytics.total,
			pending: analytics.pending,
			billable: analytics.billable,
			nonBillable: analytics.nonBillable,
		},
	};
}