import { NextResponse } from 'next/server';
import getLeadAnalytics from '@/dashboard/backend/lead-analytics';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	return 500;
}

export async function GET() {
	try {
		const data = await getLeadAnalytics();
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
