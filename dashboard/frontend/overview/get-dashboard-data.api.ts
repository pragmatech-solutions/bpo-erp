'use client';

import { apiClient } from '@/lib/api-client';
import type { DashboardData } from '@/dashboard/backend/lead-analytics/lead-analytics.type';
import type { ListLeadsInput } from '@/leads/backend/list-leads/list-leads.type';

export type DashboardApiResponse = {
	success: boolean;
	data?: DashboardData;
	error?: string;
};

export async function getDashboardDataApi(
	input: ListLeadsInput = {},
): Promise<DashboardApiResponse> {
	try {
		const query = new URLSearchParams();
		if (input.startDate)
			query.append('startDate', input.startDate.toISOString());
		if (input.endDate) query.append('endDate', input.endDate.toISOString());
		if (input.status) query.append('status', input.status);
		if (input.paymentStatus) query.append('paymentStatus', input.paymentStatus);
		if (input.campaign) query.append('campaign', input.campaign);
		if (input.agentId) query.append('agentId', input.agentId);
		if (input.teamId) query.append('teamId', input.teamId);
		if (input.deletedFilter) query.append('deletedFilter', input.deletedFilter);
		if (input.leadType) query.append('leadType', input.leadType);

		const endpoint = query.size
			? `/dashboard/api?${query.toString()}`
			: '/dashboard/api';

		return await apiClient<DashboardApiResponse>(endpoint);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Unable to fetch dashboard data';

		return { success: false, error: message };
	}
}
