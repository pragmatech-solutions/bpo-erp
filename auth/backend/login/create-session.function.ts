import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
	process.env.JWT_CREATION_KEY || 'default_secret_key_for_development',
);

export const ACCESS_TOKEN_COOKIE_NAME = 'token';
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
export const ACCESS_TOKEN_MAX_AGE_DAYS = 1 / 48; // 30 minutes
export const REFRESH_TOKEN_MAX_AGE_DAYS = 7;

type TokenType = 'access' | 'refresh';

type SessionPayload = {
	userid?: unknown;
	tokenType?: unknown;
};

async function createToken(userId: string, tokenType: TokenType, expiresIn: string) {
	return new SignJWT({ userid: userId, tokenType })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(secret);
}

export async function createSession(userId: string): Promise<string> {
	return createAccessToken(userId);
}

export async function createAccessToken(userId: string): Promise<string> {
	return createToken(userId, 'access', '30m');
}

export async function createRefreshToken(userId: string): Promise<string> {
	return createToken(userId, 'refresh', '7d');
}

export async function verifySessionToken(
	token: string,
	expectedTokenType: TokenType,
): Promise<string | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		const sessionPayload = payload as SessionPayload;

		if (typeof sessionPayload.userid !== 'string') {
			return null;
		}

		// Existing access tokens created before refresh support did not have tokenType.
		// We accept only missing access tokenType for backwards compatibility.
		if (
			sessionPayload.tokenType !== expectedTokenType &&
			!(expectedTokenType === 'access' && sessionPayload.tokenType === undefined)
		) {
			return null;
		}

		return sessionPayload.userid;
	} catch {
		return null;
	}
}
