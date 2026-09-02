import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getErrorStatus } from '@/common/backend/authorization.function';
import { bulkUpdateLeads } from '@/leads/backend/bulk-update-leads';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const result = await bulkUpdateLeads(body);
		return NextResponse.json(result);
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ success: false, error: error.message },
				{ status: 400 },
			);
		}

		const message =
			error instanceof Error ? error.message : 'Failed to update selected leads';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
