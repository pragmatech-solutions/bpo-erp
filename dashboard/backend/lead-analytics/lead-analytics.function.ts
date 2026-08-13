import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import {
	createTeamMemberLeadMatch,
	getTeamMemberIds,
} from '@/common/backend/get-team-member-ids.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import listLeads from '@/leads/backend/list-leads';
import type { DashboardData } from './lead-analytics.type';

export async function getLeadAnalytics(): Promise<DashboardData> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 14);
	const matchStage: Record<string, unknown> = {
		updated_at: { $gte: startDate },
	};

	if (currentUser.role === UserRole.TEAM_LEAD) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team lead is not assigned to a team');
		}

		matchStage.$and = [
			createTeamMemberLeadMatch(await getTeamMemberIds(currentUser.teamId)),
		];
	} else if (currentUser.role === UserRole.AGENT) {
		matchStage.created_by = new Types.ObjectId(currentUser.id);
	} else if (currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden');
	}

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

	const recentLeads = await listLeads({ limit: 5, startDate });

	return {
		analytics: {
			total: analytics.total,
			pending: analytics.pending,
			billable: analytics.billable,
			nonBillable: analytics.nonBillable,
		},
		recentLeads,
	};
}
