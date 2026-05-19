'use client';

import { apiClient } from '@/lib/api-client';
import type { DashboardData } from '@/dashboard/backend/lead-analytics/lead-analytics.type';

export type DashboardApiResponse = {
	success: boolean;
	data?: DashboardData;
	error?: string;
};

export async function getDashboardDataApi(): Promise<DashboardApiResponse> {
	try {
		return await apiClient<DashboardApiResponse>('/dashboard/api');
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Unable to fetch dashboard data';

		return { success: false, error: message };
	}
}
