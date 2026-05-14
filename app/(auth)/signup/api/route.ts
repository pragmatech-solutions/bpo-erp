import { NextResponse } from 'next/server';
import { z } from 'zod';
import signupUser from '@/auth/backend/signup';
import { signupInputSchema } from '@/auth/backend/signup/signup.input-schema';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const input = signupInputSchema.parse(body);

		const user = await signupUser(input);

		return NextResponse.json({ success: true, user }, { status: 201 });
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			const message = error.flatten().fieldErrors;

			return NextResponse.json(
				{ success: false, error: message, message: 'Invalid input' },
				{ status: 400 },
			);
		}

		const message = error instanceof Error ? error.message : 'Signup failed';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: 400 },
		);
	}
}
