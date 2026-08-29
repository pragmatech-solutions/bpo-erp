import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createTeam, listTeams } from '@/teams/backend/manage-teams';
import { getErrorStatus } from '@/common/backend/authorization.function';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';

function getListInput(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const statusParam = searchParams.get('status');
	const status: 'all' | 'active' | 'inactive' =
		statusParam === 'active' || statusParam === 'inactive'
			? statusParam
			: 'all';

	return {
		search: searchParams.get('search') || undefined,
		status,
		teamLeadId: searchParams.get('teamLeadId') || undefined,
		startDate: searchParams.get('startDate') || undefined,
		endDate: searchParams.get('endDate') || undefined,
		page: Number(searchParams.get('page') || DEFAULT_PAGE),
		limit: Number(searchParams.get('limit') || DEFAULT_PAGE_SIZE),
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

		const message =
			error instanceof Error ? error.message : 'Failed to list teams';
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

		const message =
			error instanceof Error ? error.message : 'Failed to create team';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
