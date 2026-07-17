import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { listManagedUsers } from '@/users/backend/manage-users';
import type { ListUsersInput } from '@/users/backend/manage-users/manage-users.input-schema';
import { getErrorStatus } from '@/common/backend/authorization.function';

function getListInput(request: NextRequest): ListUsersInput {
	const { searchParams } = new URL(request.url);

	return {
		role: (searchParams.get('role') || undefined) as ListUsersInput['role'],
		status: (searchParams.get('status') || undefined) as ListUsersInput['status'],
		teamId: searchParams.get('teamId') || undefined,
		withoutTeam: searchParams.get('withoutTeam') === 'true' || undefined,
		createdBy: searchParams.get('createdBy') || undefined,
		search: searchParams.get('search') || undefined,
		page: Number(searchParams.get('page') || 1),
		limit: Number(searchParams.get('limit') || 6),
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

		const message = error instanceof Error ? error.message : 'Failed to list users';
		return NextResponse.json(
			{ error: message },
			{ status: getErrorStatus(message) },
		);
	}
}
