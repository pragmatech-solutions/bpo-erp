import { NextResponse } from 'next/server';
import getLeadAnalytics from '@/dashboard/backend/lead-analytics';

export async function GET() {
	try {
		const data = await getLeadAnalytics();
		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error
				? error.message
				: 'Unable to fetch dashboard analytics';

		const status = message === 'Unauthorized' ? 401 : 500;
		return NextResponse.json({ success: false, error: message }, { status });
	}
}
