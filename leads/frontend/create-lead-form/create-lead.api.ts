'use client';

import { apiClient } from '@/lib/api-client';

export type CreateLeadPayload = {
	customer_name: string;
	customer_number: string;
	campaign: string;
	loan_type: string;
	loan_balance?: number;
	home_value?: number;
};

export type CreateLeadApiResponse = {
	success: boolean;
	error?: string;
	message?: string;
	data?: unknown;
};

export async function createLeadApi(
	payload: CreateLeadPayload,
): Promise<CreateLeadApiResponse> {
	try {
		return await apiClient<CreateLeadApiResponse>('/leads/create/api', {
			method: 'POST',
			body: JSON.stringify(payload),
		});
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Unable to create lead';

		return {
			success: false,
			error: message,
		};
	}
}
