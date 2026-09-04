'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import type { TeamOverviewItem } from '@/teams/backend/manage-teams/manage-teams.type';
import { getTeamsApi } from '@/teams/frontend/team-overview';
import type { ManagedUser } from '@/users/backend/manage-users/manage-users.type';
import {
	getManagedUsersApi,
	resetManagedUserPasswordApi,
	updateManagedUserApi,
	type ResetUserPasswordResponse,
	type UpdateManagedUserInput,
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
	const [isResettingPassword, setIsResettingPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [resetPasswordResult, setResetPasswordResult] =
		useState<ResetUserPasswordResponse | null>(null);
	const [currentRole] = useState(() => {
		const info = getCurrentLoggedInUserInformation();
		return info?.currentUser.role;
	});
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
	const isAdmin = currentRole === UserRole.ADMIN;
	const isTeamLead = currentRole === UserRole.TEAM_LEAD;
	const isManager = currentRole === UserRole.MANAGER;
	const canManageAvailability = isAdmin || isManager;

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
		input: UpdateManagedUserInput,
	) => {
		if (!isAdmin && input.status && input.status !== 'active') {
			const confirmed = window.confirm('Disable this user account?');
			if (!confirmed) return;
		}

		const previousUsers = users;
		const selectedTeam = teams.find((team) => team.id === input.teamId);

		setUsers((currentUsers) =>
			currentUsers.map((currentUser) => {
				if (currentUser.id !== user.id) return currentUser;

				return {
					...currentUser,
					...(input.role ? { role: input.role } : {}),
					...(input.status ? { status: input.status } : {}),
					...(input.availabilityStatus
						? { availabilityStatus: input.availabilityStatus }
						: {}),
					...(input.teamId !== undefined
						? {
								team:
									input.teamId === null
										? null
										: selectedTeam
											? { id: selectedTeam.id, name: selectedTeam.name }
											: currentUser.team,
							}
						: {}),
				};
			}),
		);

		try {
			setIsSaving(true);
			setErrorMessage('');
			const updatedUser = await updateManagedUserApi(user.id, input);
			setUsers((currentUsers) =>
				currentUsers.map((currentUser) =>
					currentUser.id === updatedUser.id ? updatedUser : currentUser,
				),
			);
			await loadUsers();
		} catch (error) {
			setUsers(previousUsers);
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to update user',
			);
		} finally {
			setIsSaving(false);
		}
	};

	const resetUserPassword = async (user: ManagedUser) => {
		const confirmed = window.confirm(
			`Reset password for ${user.name}? A new temporary password will be generated.`,
		);
		if (!confirmed) return;

		try {
			setIsResettingPassword(true);
			setErrorMessage('');
			const result = await resetManagedUserPasswordApi(user.id);
			setResetPasswordResult(result);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to reset password',
			);
		} finally {
			setIsResettingPassword(false);
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
		setLimit: (value: number) => {
			setLimit(value);
			setPage(1);
		},
		totalPages,
		isLoading,
		isSaving,
		isResettingPassword,
		errorMessage,
		resetPasswordResult,
		setResetPasswordResult,
		updateUser,
		resetUserPassword,
		isAdmin,
		isTeamLead,
		isManager,
		canManageAvailability,
	};
}
