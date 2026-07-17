import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createTeam, listTeams } from '@/teams/backend/manage-teams';
import { getErrorStatus } from '@/common/backend/authorization.function';

function getListInput(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const statusParam = searchParams.get('status');
	const status: 'all' | 'active' | 'inactive' =
		statusParam === 'active' || statusParam === 'inactive' ? statusParam : 'all';

	return {
		search: searchParams.get('search') || undefined,
		status,
		teamLeadId: searchParams.get('teamLeadId') || undefined,
		startDate: searchParams.get('startDate') || undefined,
		endDate: searchParams.get('endDate') || undefined,
		page: Number(searchParams.get('page') || 1),
		limit: Number(searchParams.get('limit') || 8),
	};
}

export async function GET(request: NextRequest) {
	try {
		const data = await listTeams(getListInput(request));
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message = error instanceof Error ? error.message : 'Failed to list teams';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const data = await createTeam(body);
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message = error instanceof Error ? error.message : 'Failed to create team';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}