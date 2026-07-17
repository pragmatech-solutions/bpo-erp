'use client';

import { useCallback, useEffect, useState } from 'react';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';
import type { TeamDashboardData } from '@/teams/backend/get-team-dashboard/get-team-dashboard.type';
import { getTeamDashboardApi } from './get-team-dashboard.api';

export type TeamLeadStatusFilter = LeadStatus | 'All Status';
export type TeamLeadPaymentStatusFilter = 'paid' | 'unpaid' | 'All Payment Status';

export function useTeamDashboardHook() {
	const [data, setData] = useState<TeamDashboardData | null>(null);
	const [agents, setAgents] = useState<AgentListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<TeamLeadStatusFilter>('All Status');
	const [paymentStatus, setPaymentStatus] =
		useState<TeamLeadPaymentStatusFilter>('All Payment Status');
	const [campaign, setCampaign] = useState('All Campaigns');
	const [agentId, setAgentId] = useState('All Agents');

	useEffect(() => {
		async function loadAgents() {
			const response = await getAgentsApi();
			if (response.success && response.data) {
				setAgents(response.data);
			}
		}

		loadAgents();
	}, []);

	const fetchDashboard = useCallback(async () => {
		setIsLoading(true);
		const response = await getTeamDashboardApi({
			limit: 50,
			search: search || undefined,
			status: status === 'All Status' ? undefined : status,
			paymentStatus:
				paymentStatus === 'All Payment Status' ? undefined : paymentStatus,
			campaign: campaign === 'All Campaigns' ? undefined : campaign,
			agentId: agentId === 'All Agents' ? undefined : agentId,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Unable to load team dashboard');
			setData(null);
			setIsLoading(false);
			return;
		}

		setData(response.data);
		setErrorMessage('');
		setIsLoading(false);
	}, [agentId, campaign, paymentStatus, search, status]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchDashboard();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [fetchDashboard]);

	function resetFilters() {
		setSearch('');
		setStatus('All Status');
		setPaymentStatus('All Payment Status');
		setCampaign('All Campaigns');
		setAgentId('All Agents');
	}

	return {
		data,
		agents,
		isLoading,
		errorMessage,
		filters: {
			search,
			setSearch,
			status,
			setStatus,
			paymentStatus,
			setPaymentStatus,
			campaign,
			setCampaign,
			agentId,
			setAgentId,
		},
		resetFilters,
	};
}
