import { NextRequest, NextResponse } from 'next/server';
import { getDispute } from '@/disputes/backend/get-dispute';
import { resolveDispute } from '@/disputes/backend/resolve-dispute';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	if (message.includes('not found')) return 404;
	return 400;
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id;
		const dispute = await getDispute({ id });
		return NextResponse.json({ success: true, data: dispute });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Failed to fetch dispute';
		return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(message) });
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id;
		const body = await request.json();
		const result = await resolveDispute({ ...body, id });
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Failed to resolve dispute';
		return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(message) });
	}
}
