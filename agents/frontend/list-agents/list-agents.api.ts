import { apiClient } from '@/lib/api-client';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';

export type AgentsApiResponse = {
	success: boolean;
	data?: AgentListItem[];
	error?: string;
};

export async function getAgentsApi(): Promise<AgentsApiResponse> {
	try {
		return await apiClient<AgentsApiResponse>('/agents/list/api');
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Failed to fetch agents';
		return { success: false, error: message };
	}
}
