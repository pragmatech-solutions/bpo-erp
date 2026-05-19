import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
	process.env.JWT_CREATION_KEY || 'default_secret_key_for_development',
);

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Define protected routes
	const isProtectedRoute =
		pathname.startsWith('/dashboard') || pathname.startsWith('/leads');

	if (isProtectedRoute) {
		const token = request.cookies.get('token')?.value;

		if (!token) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		try {
			await jwtVerify(token, secret);
			return NextResponse.next();
		} catch (error) {
			console.error('Middleware: JWT verification failed:', error);
			return NextResponse.redirect(new URL('/login', request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/leads/:path*'],
};
