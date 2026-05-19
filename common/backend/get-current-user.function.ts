import { jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';

const secret = new TextEncoder().encode(
	process.env.JWT_CREATION_KEY || 'default_secret_key_for_development',
);

export async function getCurrentUser(): Promise<string | null> {
	try {
		let token: string | undefined;

		// Try to get token from Authorization header
		const authHeader = (await headers()).get('Authorization');
		if (authHeader?.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1];
		}

		// If not in header, try cookies
		if (!token) {
			token = (await cookies()).get('token')?.value;
		}

		if (!token) {
			return null;
		}

		const { payload } = await jwtVerify(token, secret);
		return payload.userid as string;
	} catch (error) {
		console.error('JWT verification failed:', error);
		return null;
	}
}
