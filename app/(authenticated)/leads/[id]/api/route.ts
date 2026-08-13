import { NextRequest, NextResponse } from 'next/server';
import { getLead } from '@/leads/backend/get-lead';
import { updateLead } from '@/leads/backend/update-lead';
import { softDeleteLead } from '@/leads/backend/soft-delete-lead';

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
		const lead = await getLead({ id });
		return NextResponse.json({ success: true, data: lead });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch lead';
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
		const result = await updateLead({ ...body, id });
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to update lead';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id;
		const result = await softDeleteLead({ id });
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to soft delete lead';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
