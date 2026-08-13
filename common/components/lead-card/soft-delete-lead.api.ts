import { apiClient } from '@/lib/api-client';
import type { SoftDeleteLeadResponse } from '@/leads/backend/soft-delete-lead';

export async function softDeleteLeadApi(
	id: string,
): Promise<SoftDeleteLeadResponse> {
	try {
		return await apiClient<SoftDeleteLeadResponse>(`/leads/${id}/api`, {
			method: 'DELETE',
		});
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to soft delete lead',
		};
	}
}
