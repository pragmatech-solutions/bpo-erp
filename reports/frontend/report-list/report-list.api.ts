'use client';

import { apiClient } from '@/lib/api-client';
import type {
	ListReportInput,
	ReportRow,
} from '@/reports/backend/list-report/list-report.type';

export type ReportListApiResponse = {
	success: boolean;
	data?: ReportRow[];
	total?: number;
	page?: number;
	limit?: number;
	error?: string;
};

export async function getReportApi(
	input: ListReportInput = {},
): Promise<ReportListApiResponse> {
	try {
		const query = new URLSearchParams();
		if (input.page) query.append('page', String(input.page));
		if (input.limit) query.append('limit', String(input.limit));
		if (input.startDate)
			query.append('startDate', input.startDate.toISOString());
		if (input.endDate) query.append('endDate', input.endDate.toISOString());
		if (input.status) query.append('status', input.status);
		if (input.paymentStatus) query.append('paymentStatus', input.paymentStatus);
		if (input.search) query.append('search', input.search);
		if (input.campaign) query.append('campaign', input.campaign);
		if (input.agentId) query.append('agentId', input.agentId);
		if (input.teamId) query.append('teamId', input.teamId);
		if (input.deletedFilter) query.append('deletedFilter', input.deletedFilter);
		if (input.leadType) query.append('leadType', input.leadType);

		return await apiClient<ReportListApiResponse>(
			`/reports/api?${query.toString()}`,
		);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch report';
		return { success: false, error: message };
	}
}
