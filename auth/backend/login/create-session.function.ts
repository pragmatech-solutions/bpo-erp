import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
	process.env.JWT_CREATION_KEY || 'default_secret_key_for_development',
);

export async function createSession(userId: string): Promise<string> {
	const jwt = await new SignJWT({ userid: userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(secret);

	return jwt;
}
