'use client';

import { apiClient, setAuthTokens } from '@/lib/api-client';
import { saveCurrentLoggedInUserInformation } from './get-current-logged-in-user-information.function';

type LoginPayload = {
	identifier: string;
	password: string;
};

type LoginApiResponse = {
	success: boolean;
	error?: string | Record<string, string[]>;
	message?: string;
	user?: {
		token?: string;
		refreshToken?: string;
		[key: string]: unknown;
	};
};

export async function loginApi(
	payload: LoginPayload,
): Promise<LoginApiResponse> {
	try {
		const data = await apiClient<LoginApiResponse>('/login/api', {
			method: 'POST',
			body: JSON.stringify(payload),
		});

		if (data.success && data.user?.token && data.user.refreshToken) {
			setAuthTokens(data.user.token, data.user.refreshToken);
			if (
				typeof data.user.name === 'string' &&
				typeof data.user.role === 'string'
			) {
				saveCurrentLoggedInUserInformation(data.user.name, data.user.role);
			}
		}

		return data;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unable to login';

		return {
			success: false,
			error: message,
		};
	}
}
