import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getErrorStatus } from '@/common/backend/authorization.function';
import {
	getCurrentUserAvailability,
	updateCurrentUserAvailability,
	updateUserAvailabilityInputSchema,
} from '@/common/backend/user-availability';

export async function GET() {
	try {
		const data = await getCurrentUserAvailability();
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to get availability';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const body = await request.json();
		const input = updateUserAvailabilityInputSchema.parse(body);
		const data = await updateCurrentUserAvailability(input);

		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to update availability';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: error instanceof ZodError ? 400 : getErrorStatus(message) },
		);
	}
}