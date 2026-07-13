'use client';

import { apiClient } from '@/lib/api-client';
import type { TeamDashboardData } from '@/teams/backend/get-team-dashboard/get-team-dashboard.type';
import type { GetTeamDashboardInput } from '@/teams/backend/get-team-dashboard/get-team-dashboard.input-schema';

export type TeamDashboardApiResponse = {
	success: boolean;
	data?: TeamDashboardData;
	error?: string;
};

export async function getTeamDashboardApi(
	input: GetTeamDashboardInput = {},
): Promise<TeamDashboardApiResponse> {
	try {
		const query = new URLSearchParams();
		if (input.limit) query.append('limit', String(input.limit));
		if (input.startDate) query.append('startDate', input.startDate.toISOString());
		if (input.endDate) query.append('endDate', input.endDate.toISOString());
		if (input.status) query.append('status', input.status);
		if (input.paymentStatus) query.append('paymentStatus', input.paymentStatus);
		if (input.search) query.append('search', input.search);
		if (input.campaign) query.append('campaign', input.campaign);
		if (input.agentId) query.append('agentId', input.agentId);

		return await apiClient<TeamDashboardApiResponse>(
			`/team/dashboard/api?${query.toString()}`,
		);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Unable to fetch team dashboard';
		return { success: false, error: message };
	}
}
