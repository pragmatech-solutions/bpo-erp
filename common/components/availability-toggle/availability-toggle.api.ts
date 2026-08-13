'use client';

import { apiClient } from '@/lib/api-client';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';

type AvailabilityData = {
	availabilityStatus: UserAvailabilityStatus;
};

type AvailabilityApiResponse = {
	success: boolean;
	data?: AvailabilityData;
	error?: string;
};

export async function getAvailabilityApi(): Promise<AvailabilityApiResponse> {
	try {
		return await apiClient<AvailabilityApiResponse>('/availability/api');
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Unable to load availability',
		};
	}
}

export async function updateAvailabilityApi(
	availabilityStatus: UserAvailabilityStatus,
): Promise<AvailabilityApiResponse> {
	try {
		return await apiClient<AvailabilityApiResponse>('/availability/api', {
			method: 'PATCH',
			body: JSON.stringify({ availabilityStatus }),
		});
	} catch (error: unknown) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Unable to update availability',
		};
	}
}