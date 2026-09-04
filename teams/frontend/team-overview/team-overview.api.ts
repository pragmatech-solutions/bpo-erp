'use client';

import { apiClient } from '@/lib/api-client';
import type {
	TeamOverviewData,
	TeamPerformanceData,
} from '@/teams/backend/manage-teams/manage-teams.type';

export async function getTeamsApi(input: {
	search?: string;
	status?: 'all' | 'active' | 'inactive';
	teamLeadId?: string;
	startDate?: Date;
	endDate?: Date;
	page: number;
	limit: number;
}) {
	const params = new URLSearchParams({
		page: String(input.page),
		limit: String(input.limit),
	});
	if (input.search) params.set('search', input.search);
	if (input.status && input.status !== 'all')
		params.set('status', input.status);
	if (input.teamLeadId && input.teamLeadId !== 'all') {
		params.set('teamLeadId', input.teamLeadId);
	}
	if (input.startDate) params.set('startDate', input.startDate.toISOString());
	if (input.endDate) params.set('endDate', input.endDate.toISOString());

	return apiClient<TeamOverviewData>(`/teams/api?${params.toString()}`);
}

export async function createTeamApi(input: {
	name: string;
	teamLeadIds: string[];
	managerIds?: string[];
	memberIds: string[];
}) {
	return apiClient<{ id: string }>('/teams/api', {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

export async function getTeamPerformanceApi(id: string) {
	return apiClient<TeamPerformanceData>(`/teams/${id}/api`, {
		cache: 'no-store',
	});
}
