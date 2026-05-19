import { NextResponse } from 'next/server';
import { z } from 'zod';
import createLead from '@/leads/backend/create-lead';
import { createLeadInputSchema } from '@/leads/backend/create-lead/create-lead.input-schema';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const data = createLeadInputSchema.parse(body);

		const lead = await createLead(data);

		return NextResponse.json(
			{ success: true, data: lead, message: 'Lead created successfully' },
			{ status: 201 },
		);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			const message = Object.values(error.flatten().fieldErrors)
				.flat()
				.join(', ');

			return NextResponse.json(
				{ success: false, error: message, message: 'Invalid input' },
				{ status: 400 },
			);
		}

		const message =
			error instanceof Error ? error.message : 'Lead creation failed';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: 500 },
		);
	}
}
