import { NextResponse } from 'next/server';
import { createDispute } from '@/disputes/backend/create-dispute';
import { listDisputes } from '@/disputes/backend/list-disputes';
import { listDisputesInputSchema } from '@/disputes/backend/list-disputes/list-disputes.input-schema';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	if (message.includes('not found')) return 404;
	return 400;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const validatedInput = listDisputesInputSchema.parse({
			page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
			limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
			startDate: searchParams.get('startDate') || undefined,
			endDate: searchParams.get('endDate') || undefined,
			status: searchParams.get('status') || undefined,
			createdById: searchParams.get('createdById') || undefined,
			search: searchParams.get('search') || undefined,
		});
		const result = await listDisputes(validatedInput);
		return NextResponse.json({
			success: true,
			data: result.disputes,
			stats: result.stats,
			total: result.total,
			page: result.page,
			limit: result.limit,
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Failed to list disputes';
		return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(message) });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const result = await createDispute(body);
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Failed to create dispute';
		return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(message) });
	}
}
