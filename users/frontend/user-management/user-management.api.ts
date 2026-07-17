'use client';

import { UserRole } from '@/common/constants/user-roles.enum';
import { apiClient } from '@/lib/api-client';
import type {
	ManagedUser,
	ManagedUserListData,
	UserAccountStatus,
} from '@/users/backend/manage-users/manage-users.type';

export type UserStatusFilter = UserAccountStatus | 'all';

export async function getManagedUsersApi(input: {
	role?: UserRole | 'all';
	status?: UserStatusFilter;
	teamId?: string;
	search?: string;
	page: number;
	limit: number;
}) {
	const params = new URLSearchParams({
		page: String(input.page),
		limit: String(input.limit),
	});
	if (input.role && input.role !== 'all') params.set('role', input.role);
	if (input.status && input.status !== 'all') params.set('status', input.status);
	if (input.teamId && input.teamId !== 'all') params.set('teamId', input.teamId);
	if (input.search) params.set('search', input.search);

	return apiClient<ManagedUserListData>(`/users/api?${params.toString()}`);
}

export async function updateManagedUserApi(
	id: string,
	input: {
		status: UserAccountStatus;
	},
) {
	return apiClient<ManagedUser>(`/users/${id}/api`, {
		method: 'PATCH',
		body: JSON.stringify(input),
	});
}
