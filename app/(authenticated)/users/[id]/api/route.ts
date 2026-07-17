import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { updateManagedUser } from '@/users/backend/manage-users';
import { getErrorStatus } from '@/common/backend/authorization.function';

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const body = await request.json();
		const data = await updateManagedUser({ id, ...body });
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message = error instanceof Error ? error.message : 'Failed to update user';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
