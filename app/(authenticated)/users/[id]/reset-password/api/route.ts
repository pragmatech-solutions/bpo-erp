import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { resetUserPassword } from '@/users/backend/reset-user-password';
import { getErrorStatus } from '@/common/backend/authorization.function';

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(_request: Request, context: RouteContext) {
	try {
		const { id } = await context.params;
		const data = await resetUserPassword({ id });
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message =
			error instanceof Error ? error.message : 'Failed to reset password';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
