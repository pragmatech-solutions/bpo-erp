import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getErrorStatus } from '@/common/backend/authorization.function';
import {
	createCampaign,
	listCampaigns,
} from '@/campaigns/backend/campaigns';
import {
	createCampaignInputSchema,
	listCampaignsInputSchema,
} from '@/campaigns/backend/campaigns/campaigns.input-schema';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const status = searchParams.get('status') || undefined;
		const search = searchParams.get('search') || undefined;
		const page = searchParams.get('page')
			? Number(searchParams.get('page'))
			: undefined;
		const limit = searchParams.get('limit')
			? Number(searchParams.get('limit'))
			: undefined;

		const input = listCampaignsInputSchema.parse({
			status,
			search,
			page,
			limit,
		});
		const data = await listCampaigns(input);

		return NextResponse.json({ success: true, data });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list campaigns';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: error instanceof z.ZodError ? 400 : getErrorStatus(message) },
		);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const input = createCampaignInputSchema.parse(body);
		const data = await createCampaign(input);

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to create campaign';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: error instanceof z.ZodError ? 400 : getErrorStatus(message) },
		);
	}
}
