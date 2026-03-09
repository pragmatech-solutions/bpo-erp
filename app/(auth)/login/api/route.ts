import { NextResponse } from 'next/server';
import { z } from 'zod';
import { loginUser } from '@/auth/backend/functions/login.function';

const LoginSchema = z.object({
	email: z.email('Invalid email format'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const credentials = LoginSchema.parse(body);

		const user = await loginUser(credentials);

		return NextResponse.json({ success: true, user }, { status: 200 });
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			const message = error.flatten().fieldErrors || 'Invalid input';

			return NextResponse.json(
				{ success: false, error: message },
				{ status: 400 },
			);
		}

		const message =
			error instanceof Error ? error.message : 'Authentication failed';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: 401 },
		);
	}
}
