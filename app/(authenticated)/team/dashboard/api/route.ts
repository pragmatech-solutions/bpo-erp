import { NextResponse } from 'next/server';
import getTeamDashboard from '@/teams/backend/get-team-dashboard';
import { getTeamDashboardInputSchema } from '@/teams/backend/get-team-dashboard/get-team-dashboard.input-schema';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	if (message.includes('not found')) return 404;
	return 500;
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
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

		const validatedInput = getTeamDashboardInputSchema.parse({
			limit,
			startDate,
			endDate,
			status,
			paymentStatus,
			search,
			campaign,
			agentId,
		});

		const data = await getTeamDashboard(validatedInput);
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to load team dashboard';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
