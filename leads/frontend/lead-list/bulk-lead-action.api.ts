import { apiClient } from '@/lib/api-client';
import type {
	BulkLeadAction,
	BulkUpdateLeadsResponse,
} from '@/leads/backend/bulk-update-leads';

export type { BulkLeadAction };

type BulkUpdateLeadsApiResponse = BulkUpdateLeadsResponse & {
	error?: string;
};

export async function bulkUpdateLeadsApi(input: {
	leadIds: string[];
	action: BulkLeadAction;
}): Promise<BulkUpdateLeadsApiResponse> {
	try {
		return await apiClient<BulkUpdateLeadsResponse>('/leads/bulk/api', {
			method: 'POST',
			body: JSON.stringify(input),
		});
	} catch (error: unknown) {
		return {
			success: false,
			message: '',
			error:
				error instanceof Error
					? error.message
					: 'Failed to update selected leads',
			matchedCount: 0,
			modifiedCount: 0,
		};
	}
}
