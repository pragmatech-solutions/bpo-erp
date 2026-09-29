'use client';

import { apiClient } from '@/lib/api-client';
import type {
	DisputeStats,
	ListedDispute,
} from '@/disputes/backend/list-disputes/list-disputes.type';
import type { DisputeStatus } from '@/common/constants/dispute-status.enum';

export type GetDisputesInput = {
	page?: number;
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	status?: DisputeStatus;
	createdById?: string;
	search?: string;
};

export type GetDisputesResponse = {
	success: boolean;
	data?: ListedDispute[];
	stats?: DisputeStats;
	total?: number;
	page?: number;
	limit?: number;
	error?: string;
};

export async function getDisputesApi(
	input: GetDisputesInput = {},
): Promise<GetDisputesResponse> {
	try {
		const params = new URLSearchParams();
		if (input.page) params.set('page', String(input.page));
		if (input.limit) params.set('limit', String(input.limit));
		if (input.startDate) params.set('startDate', input.startDate.toISOString());
		if (input.endDate) params.set('endDate', input.endDate.toISOString());
		if (input.status) params.set('status', input.status);
		if (input.createdById) params.set('createdById', input.createdById);
		if (input.search) params.set('search', input.search);

		return await apiClient<GetDisputesResponse>(
			'/disputes/api?' + params.toString(),
		);
	} catch (error: unknown) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch disputes',
		};
	}
}
