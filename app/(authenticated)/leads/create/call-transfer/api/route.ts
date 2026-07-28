import { NextResponse } from 'next/server';
import { z } from 'zod';
import createCallTransferLead, {
	createCallTransferLeadInputSchema,
} from '@/leads/backend/create-call-transfer-lead';

function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	if (message.includes('not found')) return 404;
	return 400;
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const data = createCallTransferLeadInputSchema.parse(body);
		const lead = await createCallTransferLead(data);

		return NextResponse.json(
			{
				success: true,
				data: lead,
				message: 'Call transfer lead created successfully',
			},
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
			error instanceof Error
				? error.message
				: 'Call transfer lead creation failed';

		return NextResponse.json(
			{ success: false, error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
