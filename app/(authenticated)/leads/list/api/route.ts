import { NextResponse } from 'next/server';
import listLeads from '@/leads/backend/list-leads';
import { listLeadsInputSchema } from '@/leads/backend/list-leads/list-leads.input-schema';

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

		const validatedInput = listLeadsInputSchema.parse({
			limit,
			startDate,
			endDate,
			status,
			paymentStatus,
			search,
			campaign,
			agentId,
		});

		const leads = await listLeads(validatedInput);

		return NextResponse.json({ success: true, data: leads });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to list leads';
		return NextResponse.json(
			{ success: false, error: message },
			{ status: 500 },
		);
	}
}
