'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import type { TeamOverviewItem } from '@/teams/backend/manage-teams/manage-teams.type';
import { getTeamsApi } from '@/teams/frontend/team-overview';
import type {
	ManagedUser,
	UserAccountStatus,
} from '@/users/backend/manage-users/manage-users.type';
import {
	getManagedUsersApi,
	updateManagedUserApi,
	type UserStatusFilter,
} from './user-management.api';

export function useUserManagementHook() {
	const [users, setUsers] = useState<ManagedUser[]>([]);
	const [teams, setTeams] = useState<TeamOverviewItem[]>([]);
	const [role, setRole] = useState<UserRole | 'all'>('all');
	const [status, setStatus] = useState<UserStatusFilter>('all');
	const [teamId, setTeamId] = useState('all');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [currentRole] = useState(() => {
		const info = getCurrentLoggedInUserInformation();
		return info?.currentUser.role;
	});
	const limit = 6;
	const isAdmin = currentRole === UserRole.ADMIN;
	const isTeamLead = currentRole === UserRole.TEAM_LEAD;

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / limit)),
		[total, limit],
	);

	const loadUsers = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const data = await getManagedUsersApi({
				role: isAdmin ? role : 'all',
				status,
				teamId: isAdmin ? teamId : 'all',
				search,
				page,
				limit,
			});
			setUsers(data.users);
			setTotal(data.total);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to load users',
			);
		} finally {
			setIsLoading(false);
		}
	}, [isAdmin, limit, page, role, search, status, teamId]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	useEffect(() => {
		if (!isAdmin) return;

		async function loadTeams() {
			try {
				const data = await getTeamsApi({ page: 1, limit: 50 });
				setTeams(data.teams);
			} catch {
				setTeams([]);
			}
		}

		loadTeams();
	}, [isAdmin]);

	const updateUser = async (
		user: ManagedUser,
		input: {
			status: UserAccountStatus;
		},
	) => {
		if (input.status && input.status !== 'active') {
			const confirmed = window.confirm('Disable this user account?');
			if (!confirmed) return;
		}

		try {
			setIsSaving(true);
			setErrorMessage('');
			await updateManagedUserApi(user.id, input);
			await loadUsers();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to update user',
			);
		} finally {
			setIsSaving(false);
		}
	};

	return {
		users,
		teams,
		role,
		setRole: (value: UserRole | 'all') => {
			setRole(value);
			setPage(1);
		},
		status,
		setStatus: (value: UserStatusFilter) => {
			setStatus(value);
			setPage(1);
		},
		teamId,
		setTeamId: (value: string) => {
			setTeamId(value);
			setPage(1);
		},
		search,
		setSearch: (value: string) => {
			setSearch(value);
			setPage(1);
		},
		page,
		setPage,
		total,
		limit,
		totalPages,
		isLoading,
		isSaving,
		errorMessage,
		updateUser,
		isAdmin,
		isTeamLead,
	};
}
