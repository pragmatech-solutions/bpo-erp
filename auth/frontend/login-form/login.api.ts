'use client';

import { apiClient, setToken } from '@/lib/api-client';

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
		[key: string]: any;
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
		}

		return data;
	} catch (error: any) {
		return {
			success: false,
			error: error.message || 'Unable to login',
		};
	}
}
