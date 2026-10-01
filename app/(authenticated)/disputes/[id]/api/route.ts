import { NextRequest, NextResponse } from 'next/server';
import { getDispute } from '@/disputes/backend/get-dispute';
import { resolveDispute } from '@/disputes/backend/resolve-dispute';
import { updateLoanOfficerNotes } from '@/disputes/backend/update-loan-officer-notes';

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
		const message =
			error instanceof Error ? error.message : 'Failed to fetch dispute';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id;
		const body = await request.json();
		const { action, ...payload } = body;
		const result =
			action === 'loan_officer_notes'
				? await updateLoanOfficerNotes({ ...payload, id })
				: await resolveDispute({ ...payload, id });
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to update dispute';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
