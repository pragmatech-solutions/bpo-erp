'use client';

import { apiClient } from '@/lib/api-client';

export type CreateDisputePayload = {
	leadId: string;
	recordingLink?: string;
	qaNotes: string;
};

export type CreateDisputeResponse = {
	success: boolean;
	message?: string;
	id?: string;
	error?: string;
};

export async function createDisputeApi(
	payload: CreateDisputePayload,
): Promise<CreateDisputeResponse> {
	try {
		return await apiClient<CreateDisputeResponse>('/disputes/api', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create dispute',
		};
	}
}
