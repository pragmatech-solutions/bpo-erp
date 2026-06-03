import { apiClient } from '@/lib/api-client';
import type {
	UpdateLeadInput,
	UpdateLeadResponse,
} from '@/leads/backend/update-lead';

export async function updateLeadApi(
	payload: UpdateLeadInput,
): Promise<UpdateLeadResponse> {
	try {
		return await apiClient<UpdateLeadResponse>(`/leads/${payload.id}/api`, {
			method: 'PATCH',
			body: JSON.stringify(payload),
		});
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to update lead';
		return { success: false, error: message };
	}
}
