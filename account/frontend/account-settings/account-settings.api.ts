'use client';

import { apiClient } from '@/lib/api-client';

export type AccountSettingsData = {
	id: string;
	name: string;
	username: string;
	email: string;
	phoneNumber: string;
};

export type UpdateAccountPayload = {
	name: string;
	email?: string;
	phoneNumber?: string;
	currentPassword: string;
	newPassword: string;
};

export function getAccountSettingsApi() {
	return apiClient<AccountSettingsData>('/settings/api');
}

export function updateAccountSettingsApi(payload: UpdateAccountPayload) {
	return apiClient<AccountSettingsData>('/settings/api', {
		method: 'PATCH',
		body: JSON.stringify(payload),
	});
}
