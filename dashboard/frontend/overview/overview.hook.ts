'use client';

import { useEffect, useState } from 'react';
import type { DashboardData } from '@/dashboard/backend/lead-analytics/lead-analytics.type';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { getDashboardDataApi } from './get-dashboard-data.api';

export function useOverviewHook() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [currentUserName] = useState(() => {
		const currentUserInformation = getCurrentLoggedInUserInformation();
		return currentUserInformation?.currentUser.name || 'User';
	});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		async function loadDashboardData() {
			setIsLoading(true);
			const response = await getDashboardDataApi();

			if (!response.success || !response.data) {
				setErrorMessage(response.error || 'Unable to load dashboard');
				setIsLoading(false);
				return;
			}

			setData(response.data);
			setIsLoading(false);
		}

		loadDashboardData();
	}, []);

	return { data, currentUserName, isLoading, errorMessage };
}
