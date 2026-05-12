'use client';

type LoginPayload = {
	email: string;
	password: string;
};

type LoginApiResponse = {
	success: boolean;
	error?: string | Record<string, string[]>;
	message?: string;
	user?: unknown;
};

export async function loginApi(
	payload: LoginPayload,
): Promise<LoginApiResponse> {
	const response = await fetch('/login/api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	const data = (await response.json()) as LoginApiResponse;

	if (!response.ok) {
		return {
			success: false,
			error: data.error || data.message || 'Unable to login',
		};
	}

	return data;
}
