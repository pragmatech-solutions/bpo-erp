import { apiClient } from '@/lib/api-client';
import type { LeadDetails } from '@/leads/backend/get-lead';

export type GetLeadApiResponse = {
	success: boolean;
	data?: LeadDetails;
	error?: string;
};

export async function getLeadApi(id: string): Promise<GetLeadApiResponse> {
	try {
		return await apiClient<GetLeadApiResponse>(`/leads/${id}/api`);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch lead';
		return { success: false, error: message };
	}
}
