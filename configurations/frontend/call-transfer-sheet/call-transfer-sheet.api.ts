import { apiClient } from '@/lib/api-client';

type CallTransferSheetResponse = {
	success: boolean;
	data?: {
		value: string;
	};
	error?: string;
};

export function getCallTransferSheetApi() {
	return apiClient<CallTransferSheetResponse>(
		'/portal-settings/call-transfer-sheet/api',
	);
}

export function updateCallTransferSheetApi(value: string) {
	return apiClient<CallTransferSheetResponse>(
		'/portal-settings/call-transfer-sheet/api',
		{
			method: 'PATCH',
			body: JSON.stringify({ value }),
		},
	);
}
