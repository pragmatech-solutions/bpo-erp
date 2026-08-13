import { cookies, headers } from 'next/headers';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	verifySessionToken,
} from '@/auth/backend/login/create-session.function';

export async function getCurrentUser(): Promise<string | null> {
	let token: string | undefined;

	const authHeader = (await headers()).get('Authorization');
	if (authHeader?.startsWith('Bearer ')) {
		token = authHeader.split(' ')[1];
	}

	if (!token) {
		token = (await cookies()).get(ACCESS_TOKEN_COOKIE_NAME)?.value;
	}

	if (!token) {
		return null;
	}

	return verifySessionToken(token, 'access');
}
