'use client';

import { SignupInput } from '@/auth/backend/signup/signup.input-schema';
import { SignupResponse } from '@/auth/backend/signup/signup.type';

export async function signupApi(payload: SignupInput): Promise<SignupResponse> {
	const response = await fetch('/signup/api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const data = (await response.json()) as SignupResponse;

	if (!response.ok) {
		return {
			success: false,
			error: data.error || data.message || 'Unable to create account',
		};
	}

	return data;
}
