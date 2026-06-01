import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
	process.env.JWT_CREATION_KEY || 'default_secret_key_for_development',
);

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get('token')?.value;

	const isAuthRoute = ['/login', '/signup'].includes(pathname);
	const isProtectedRoute =
		pathname.startsWith('/dashboard') || pathname.startsWith('/leads');

	// Scenario 1: User is logged in
	if (token) {
		try {
			// Verify session validity
			await jwtVerify(token, secret);

			// Redirect away from auth pages or root to dashboard
			if (isAuthRoute || pathname === '/') {
				return NextResponse.redirect(new URL('/dashboard', request.url));
			}

			return NextResponse.next();
		} catch (error) {
			console.error('Proxy: Session invalid, clearing token.', error);
			const response = NextResponse.redirect(new URL('/login', request.url));
			response.cookies.delete('token');
			return response;
		}
	}

	// Scenario 2: User is NOT logged in
	if (isProtectedRoute) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/leads/:path*', '/login', '/signup', '/'],
};
