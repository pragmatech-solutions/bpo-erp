import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getErrorStatus } from '@/common/backend/authorization.function';
import {
	getCallTransferSheet,
	updateCallTransferSheet,
} from '@/configurations/backend/call-transfer-sheet';

export async function GET() {
	try {
		const data = await getCallTransferSheet();
		return NextResponse.json({ success: true, data });
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Unable to load the call transfer sheet';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const data = await updateCallTransferSheet(await request.json());
		return NextResponse.json({ success: true, data });
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Unable to update the call transfer sheet';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: error instanceof ZodError ? 400 : getErrorStatus(message) },
		);
	}
}
