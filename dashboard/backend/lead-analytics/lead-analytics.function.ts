import { Types } from 'mongoose';
import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import listLeads from '@/leads/backend/list-leads';
import type { DashboardData } from './lead-analytics.type';

export async function getLeadAnalytics(): Promise<DashboardData> {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();
	if (!currentUserId) throw new Error('Unauthorized');

	const currentUser = await Users.findById(currentUserId).lean();
	if (!currentUser) throw new Error('User not found');

	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 14);
	const matchStage: Record<string, unknown> = {
		updated_at: { $gte: startDate },
	};

	if (currentUser.role !== 'admin') {
		matchStage.created_by = new Types.ObjectId(currentUserId);
	}

	const analyticsRows = await Leads.aggregate([
		{ $match: matchStage },
		{
			$group: {
				_id: null,
				total: { $sum: 1 },
				pending: {
					$sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
				},
				billable: {
					$sum: { $cond: [{ $eq: ['$status', 'billable'] }, 1, 0] },
				},
				nonBillable: {
					$sum: { $cond: [{ $eq: ['$status', 'non billable'] }, 1, 0] },
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
