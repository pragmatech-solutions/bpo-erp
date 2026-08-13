import { apiClient } from '@/lib/api-client';
import type {
	ListedLead,
	ListLeadsInput,
} from '@/leads/backend/list-leads/list-leads.type';

export type LeadListApiResponse = {
	success: boolean;
	data?: ListedLead[];
	total?: number;
	page?: number;
	limit?: number;
	error?: string;
};

export async function getLeadsApi(
	input: ListLeadsInput = {},
): Promise<LeadListApiResponse> {
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
		if (input.deletedFilter) query.append('deletedFilter', input.deletedFilter);

		// apiClient is a function in this project, not an object with a .get method
		return await apiClient<LeadListApiResponse>(
			`/leads/list/api?${query.toString()}`,
		);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch leads';
		return { success: false, error: message };
	}
}
