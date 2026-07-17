'use client';

import { apiClient } from '@/lib/api-client';
import type {
	CampaignListData,
	CampaignListItem,
} from '@/campaigns/backend/campaigns/campaigns.type';

export type CampaignStatusFilter = 'all' | 'active' | 'disabled';

type ApiResponse<T> = {
	success: boolean;
	data?: T;
	error?: string;
};

function unwrapCampaignResponse<T>(response: ApiResponse<T>, fallback: string): T {
	if (!response.success || response.data === undefined) {
		throw new Error(response.error || fallback);
	}

	return response.data;
}

export async function getCampaignsApi(input: {
	search?: string;
	status?: CampaignStatusFilter;
	page: number;
	limit: number;
}) {
	const params = new URLSearchParams({
		page: String(input.page),
		limit: String(input.limit),
	});
	if (input.search) params.set('search', input.search);
	if (input.status && input.status !== 'all') params.set('status', input.status);

	const response = await apiClient<ApiResponse<CampaignListData>>(
		`/campaigns/api?${params.toString()}`,
	);

	return unwrapCampaignResponse(response, 'Unable to load campaigns');
}

export async function createCampaignApi(input: {
	name: string;
	isActive: boolean;
}) {
	const response = await apiClient<
		ApiResponse<{ id: string; name: string; isActive: boolean }>
	>('/campaigns/api', {
		method: 'POST',
		body: JSON.stringify(input),
	});

	return unwrapCampaignResponse(response, 'Unable to create campaign');
}

export async function updateCampaignApi(
	id: string,
	input: {
		name?: string;
		isActive?: boolean;
	},
) {
	const response = await apiClient<ApiResponse<CampaignListItem>>(
		`/campaigns/${id}/api`,
		{
			method: 'PATCH',
			body: JSON.stringify(input),
		},
	);

	return unwrapCampaignResponse(response, 'Unable to update campaign');
}
