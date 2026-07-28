'use client';

import { apiClient } from '@/lib/api-client';
import type { CreateCallTransferLeadInput } from '@/leads/backend/create-call-transfer-lead/create-call-transfer-lead.input-schema';
import type { CreateCallTransferLeadResponse } from '@/leads/backend/create-call-transfer-lead/create-call-transfer-lead.type';

export async function createCallTransferLeadApi(
	payload: CreateCallTransferLeadInput,
): Promise<CreateCallTransferLeadResponse> {
	try {
		return await apiClient<CreateCallTransferLeadResponse>(
			'/leads/create/call-transfer/api',
			{
				method: 'POST',
				body: JSON.stringify(payload),
			},
		);
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Unable to create call transfer lead',
		};
	}
}
