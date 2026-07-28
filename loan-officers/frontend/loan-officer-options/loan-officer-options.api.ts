'use client';

import { apiClient } from '@/lib/api-client';
import type { LoanOfficerOption } from '@/loan-officers/backend/list-loan-officers';

export type LoanOfficerOptionsApiResponse = {
	success: boolean;
	data?: LoanOfficerOption[];
	error?: string;
};

export async function getLoanOfficerOptionsApi(): Promise<LoanOfficerOptionsApiResponse> {
	try {
		return await apiClient<LoanOfficerOptionsApiResponse>(
			'/loan-officers/options/api',
		);
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Unable to load loan officers',
		};
	}
}
