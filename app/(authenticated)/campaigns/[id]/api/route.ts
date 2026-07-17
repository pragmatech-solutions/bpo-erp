import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getErrorStatus } from '@/common/backend/authorization.function';
import { updateCampaign } from '@/campaigns/backend/campaigns';
import { updateCampaignInputSchema } from '@/campaigns/backend/campaigns/campaigns.input-schema';

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const id = (await params).id;
		const body = await req.json();
		const input = updateCampaignInputSchema.parse({ ...body, id });
		const data = await updateCampaign(input);

		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to update campaign';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: error instanceof z.ZodError ? 400 : getErrorStatus(message) },
		);
	}
}
