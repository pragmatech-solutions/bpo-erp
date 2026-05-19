'use client';

import { SignupInput } from '@/auth/backend/signup/signup.input-schema';
import { SignupResponse } from '@/auth/backend/signup/signup.type';
import { apiClient, setToken } from '@/lib/api-client';

export async function signupApi(payload: SignupInput): Promise<SignupResponse> {
	try {
		const data = await apiClient<SignupResponse>('/signup/api', {
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
			error: error.message || 'Unable to create account',
		};
	}
}
