import { NextResponse } from 'next/server';
import { listReport } from '@/reports/backend/list-report';
import { listReportInputSchema } from '@/reports/backend/list-report/list-report.input-schema';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	return 500;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const page = searchParams.get('page')
			? Number(searchParams.get('page'))
			: undefined;
		const limit = searchParams.get('limit')
			? Number(searchParams.get('limit'))
			: undefined;
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;
		const status = searchParams.get('status') || undefined;
		const paymentStatus = searchParams.get('paymentStatus') || undefined;
		const search = searchParams.get('search') || undefined;
		const campaign = searchParams.get('campaign') || undefined;
		const agentId = searchParams.get('agentId') || undefined;
		const teamId = searchParams.get('teamId') || undefined;
		const deletedFilter = searchParams.get('deletedFilter') || undefined;
		const leadType = searchParams.get('leadType') || undefined;

		const validatedInput = listReportInputSchema.parse({
			page,
			limit,
			startDate,
			endDate,
			status,
			paymentStatus,
			search,
			campaign,
			agentId,
			teamId,
			deletedFilter,
			leadType,
		});

		const result = await listReport(validatedInput);

		return NextResponse.json({
			success: true,
			data: result.rows,
			total: result.total,
			page: result.page,
			limit: result.limit,
		});
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list report';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
