'use client';

import { apiClient } from '@/lib/api-client';

export async function getCampaignOptionsApi() {
	return apiClient<{ campaigns: string[] }>('/campaigns/options/api');
}
