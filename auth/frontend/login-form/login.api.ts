'use client';

import { apiClient, setToken } from '@/lib/api-client';
import { saveCurrentLoggedInUserInformation } from './get-current-logged-in-user-information.function';

type LoginPayload = {
	email: string;
	password: string;
};

type LoginApiResponse = {
	success: boolean;
	error?: string | Record<string, string[]>;
	message?: string;
	user?: {
		token?: string;
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

		if (data.success && data.user?.token) {
			setToken(data.user.token);
			if (typeof data.user.name === 'string') {
				saveCurrentLoggedInUserInformation(data.user.name);
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
