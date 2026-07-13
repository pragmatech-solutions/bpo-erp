'use client';

import Overview from '@/dashboard/frontend/overview';
import TeamDashboard from '@/teams/frontend/team-dashboard';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';

export function DashboardRouter() {
	const currentUserInformation = getCurrentLoggedInUserInformation();

	if (currentUserInformation?.currentUser.role === UserRole.TEAM_LEAD) {
		return <TeamDashboard />;
	}

	return <Overview />;
}
