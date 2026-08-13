import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	createAccessToken,
	REFRESH_TOKEN_COOKIE_NAME,
	verifySessionToken,
} from '@/auth/backend/login/create-session.function';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 30 * 60;

async function refreshAccessTokenFromRequest(request: NextRequest) {
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
	if (!refreshToken) return null;

	const userId = await verifySessionToken(refreshToken, 'refresh');
	if (!userId) return null;

	return createAccessToken(userId);
}

function setAccessTokenCookie(response: NextResponse, token: string) {
	response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
		maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
		path: '/',
	});
}

function clearAuthCookies(response: NextResponse) {
	response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
	response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

	const isAuthRoute = ['/login', '/signup'].includes(pathname);
	const isProtectedRoute =
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/leads') ||
		pathname.startsWith('/teams') ||
		pathname.startsWith('/users') ||
		pathname.startsWith('/campaigns') ||
		pathname.startsWith('/settings');

	if (token) {
		const userId = await verifySessionToken(token, 'access');

		if (userId) {
			if (isAuthRoute || pathname === '/') {
				return NextResponse.redirect(new URL('/dashboard', request.url));
			}

			return NextResponse.next();
		}

		const refreshedToken = await refreshAccessTokenFromRequest(request);
		if (refreshedToken) {
			const response = isAuthRoute || pathname === '/'
				? NextResponse.redirect(new URL('/dashboard', request.url))
				: NextResponse.next();
			setAccessTokenCookie(response, refreshedToken);
			return response;
		}

		const response = NextResponse.redirect(new URL('/login', request.url));
		clearAuthCookies(response);
		return response;
	}

	const refreshedToken = await refreshAccessTokenFromRequest(request);
	if (refreshedToken) {
		const response = isAuthRoute || pathname === '/'
			? NextResponse.redirect(new URL('/dashboard', request.url))
			: NextResponse.next();
		setAccessTokenCookie(response, refreshedToken);
		return response;
	}

	if (isProtectedRoute) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/leads/:path*',
		'/teams/:path*',
		'/users/:path*',
		'/campaigns/:path*',
		'/login',
		'/signup',
		'/',
	],
};

