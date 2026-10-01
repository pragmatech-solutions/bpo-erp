'use client';

import { apiClient } from '@/lib/api-client';
import type { LeadStatus } from '@/common/constants/lead-status.enum';
import type { ListedDispute } from '@/disputes/backend/list-disputes/list-disputes.type';

export type GetDisputeResponse = {
	success: boolean;
	data?: ListedDispute;
	error?: string;
};

export type ResolveDisputeResponse = {
	success: boolean;
	message?: string;
	error?: string;
};

export async function getDisputeApi(id: string): Promise<GetDisputeResponse> {
	try {
		return await apiClient<GetDisputeResponse>('/disputes/' + id + '/api');
	} catch (error: unknown) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch dispute',
		};
	}
}

export async function resolveDisputeApi(
	id: string,
	payload: {
		decision: LeadStatus.BILLABLE | LeadStatus.NON_BILLABLE;
		decisionNotes?: string;
	},
): Promise<ResolveDisputeResponse> {
	try {
		return await apiClient<ResolveDisputeResponse>('/disputes/' + id + '/api', {
			method: 'PATCH',
			body: JSON.stringify(payload),
		});
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to resolve dispute',
		};
	}
}

export async function saveLoanOfficerNotesApi(
	id: string,
	loanOfficerNotes: string,
): Promise<ResolveDisputeResponse> {
	try {
		return await apiClient<ResolveDisputeResponse>('/disputes/' + id + '/api', {
			method: 'PATCH',
			body: JSON.stringify({ action: 'loan_officer_notes', loanOfficerNotes }),
		});
	} catch (error: unknown) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to save notes',
		};
	}
}
