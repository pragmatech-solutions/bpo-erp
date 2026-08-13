import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAccount, updateAccount } from '@/account/backend/account';
import { getErrorStatus } from '@/common/backend/authorization.function';

export async function GET() {
	try {
		const data = await getAccount();
		return NextResponse.json(data);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load account';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const data = await updateAccount(body);
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message =
			error instanceof Error ? error.message : 'Failed to update account';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
