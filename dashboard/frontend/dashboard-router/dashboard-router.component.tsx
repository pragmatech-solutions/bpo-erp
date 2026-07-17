'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Overview from '@/dashboard/frontend/overview';
import TeamDashboard from '@/teams/frontend/team-dashboard';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';

function subscribeToCurrentUser(callback: () => void) {
	window.addEventListener('storage', callback);
	return () => window.removeEventListener('storage', callback);
}

function getCurrentRoleSnapshot() {
	const currentUserInformation = getCurrentLoggedInUserInformation();
	return currentUserInformation?.currentUser.role as UserRole | undefined;
}

function getServerRoleSnapshot() {
	return undefined;
}

export function DashboardRouter() {
	const router = useRouter();
	const currentRole = useSyncExternalStore(
		subscribeToCurrentUser,
		getCurrentRoleSnapshot,
		getServerRoleSnapshot,
	);

	useEffect(() => {
		if (currentRole === UserRole.QUALITY_ASSURANCE) {
			router.replace('/leads/list');
		}
	}, [currentRole, router]);

	if (!currentRole || currentRole === UserRole.QUALITY_ASSURANCE) {
		return null;
	}

	if (currentRole === UserRole.TEAM_LEAD) {
		return <TeamDashboard />;
	}

	return <Overview />;
}