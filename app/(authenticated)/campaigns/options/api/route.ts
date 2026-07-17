import { NextResponse } from 'next/server';
import { listActiveCampaignNames } from '@/campaigns/backend/campaigns';
import { getErrorStatus } from '@/common/backend/authorization.function';

export async function GET() {
	try {
		const campaigns = await listActiveCampaignNames();
		return NextResponse.json({ campaigns });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to load campaigns';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
