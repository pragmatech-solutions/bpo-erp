'use client';

import { useEffect, useState } from 'react';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { getAvailabilityApi, updateAvailabilityApi } from './availability-toggle.api';

export function useAvailabilityToggleHook() {
	const [availabilityStatus, setAvailabilityStatus] =
		useState<UserAvailabilityStatus>(UserAvailabilityStatus.INACTIVE);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		async function loadAvailability() {
			setIsLoading(true);
			const response = await getAvailabilityApi();

			if (response.success && response.data) {
				setAvailabilityStatus(response.data.availabilityStatus);
				setErrorMessage('');
			} else {
				setErrorMessage(response.error || 'Unable to load availability');
			}

			setIsLoading(false);
		}

		loadAvailability();
	}, []);

	async function toggleAvailability() {
		if (isLoading || isUpdating) return;

		const nextStatus =
			availabilityStatus === UserAvailabilityStatus.ACTIVE
				? UserAvailabilityStatus.INACTIVE
				: UserAvailabilityStatus.ACTIVE;

		setIsUpdating(true);
		const response = await updateAvailabilityApi(nextStatus);

		if (response.success && response.data) {
			setAvailabilityStatus(response.data.availabilityStatus);
			setErrorMessage('');
		} else {
			setErrorMessage(response.error || 'Unable to update availability');
		}

		setIsUpdating(false);
	}

	return {
		availabilityStatus,
		isActive: availabilityStatus === UserAvailabilityStatus.ACTIVE,
		isLoading,
		isUpdating,
		errorMessage,
		toggleAvailability,
	};
}