import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { listManagedUsers } from '@/users/backend/manage-users';
import type { ListUsersInput } from '@/users/backend/manage-users/manage-users.input-schema';
import { getErrorStatus } from '@/common/backend/authorization.function';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';

function getListInput(request: NextRequest): ListUsersInput {
	const { searchParams } = new URL(request.url);

	return {
		role: (searchParams.get('role') || undefined) as ListUsersInput['role'],
		status: (searchParams.get('status') ||
			undefined) as ListUsersInput['status'],
		teamId: searchParams.get('teamId') || undefined,
		withoutTeam: searchParams.get('withoutTeam') === 'true' || undefined,
		createdBy: searchParams.get('createdBy') || undefined,
		search: searchParams.get('search') || undefined,
		page: Number(searchParams.get('page') || DEFAULT_PAGE),
		limit: Number(searchParams.get('limit') || DEFAULT_PAGE_SIZE),
	};
}

export async function GET(request: NextRequest) {
	try {
		const data = await listManagedUsers(getListInput(request));
		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		const message =
			error instanceof Error ? error.message : 'Failed to list users';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
