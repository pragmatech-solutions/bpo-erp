'use client';

import { apiClient } from '@/lib/api-client';
import type { CreateInsellerateLeadInput } from '@/leads/backend/create-insellerate-lead/create-insellerate-lead.input-schema';
import type { CreateInsellerateLeadResponse } from '@/leads/backend/create-insellerate-lead/create-insellerate-lead.type';

export async function createInsellerateLeadApi(
	payload: CreateInsellerateLeadInput,
): Promise<CreateInsellerateLeadResponse> {
	try {
		return await apiClient<CreateInsellerateLeadResponse>(
			'/leads/create/insellerate/api',
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
					: 'Unable to create insellerate lead',
		};
	}
}
