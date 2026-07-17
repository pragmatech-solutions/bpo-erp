import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getTeamPerformance } from '@/teams/backend/manage-teams';
import { getErrorStatus } from '@/common/backend/authorization.function';

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_request: Request, context: RouteContext) {
	try {
		const { id } = await context.params;
		const data = await getTeamPerformance({ id });
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message =
			error instanceof Error ? error.message : 'Failed to load team performance';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
