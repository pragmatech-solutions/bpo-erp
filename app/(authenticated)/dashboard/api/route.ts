import { NextResponse } from 'next/server';
import getLeadAnalytics from '@/dashboard/backend/lead-analytics';
import { listLeadsInputSchema } from '@/leads/backend/list-leads/list-leads.input-schema';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	return 500;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;
		const status = searchParams.get('status') || undefined;
		const paymentStatus = searchParams.get('paymentStatus') || undefined;
		const campaign = searchParams.get('campaign') || undefined;
		const agentId = searchParams.get('agentId') || undefined;
		const teamId = searchParams.get('teamId') || undefined;
		const deletedFilter = searchParams.get('deletedFilter') || undefined;

		const validatedInput = listLeadsInputSchema.parse({
			startDate,
			endDate,
			status,
			paymentStatus,
			campaign,
			agentId,
			teamId,
			deletedFilter,
		});

		const data = await getLeadAnalytics(validatedInput);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error
				? error.message
				: 'Unable to fetch dashboard analytics';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}