'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';
import { getLeadsApi } from './lead-list.api';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';
import { getCampaignOptionsApi } from '@/campaigns/frontend/campaign-options';
import { getTeamsApi } from '@/teams/frontend/team-overview';
import type { TeamOverviewItem } from '@/teams/backend/manage-teams/manage-teams.type';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import {
	getPacificDateRangeForPreset,
	getPacificDateRangeFromCalendarDates,
} from '@/common/utils/pacific-time';

export type DurationPreset =
	| 'Today'
	| 'Yesterday'
	| 'Last 7 Days'
	| 'Week to Date'
	| 'Last 30 Days'
	| 'This Month'
	| 'Last Month'
	| 'All'
	| 'Custom Range';

export type LeadStatusFilter = LeadStatus | 'All Status';
export type PaymentStatusFilter = 'paid' | 'unpaid' | 'All Payment Status';
export type DeletedLeadFilter = 'active' | 'deleted' | 'all';

function subscribeToCurrentUser(callback: () => void) {
	window.addEventListener('storage', callback);
	return () => window.removeEventListener('storage', callback);
}

function getCurrentRoleSnapshot() {
	const userInfo = getCurrentLoggedInUserInformation();
	return (userInfo?.currentUser?.role as UserRole | undefined) || null;
}

function getServerRoleSnapshot() {
	return null;
}
export function useLeadListHook() {
	const [leads, setLeads] = useState<ListedLead[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<LeadStatusFilter>('All Status');
	const [paymentStatus, setPaymentStatus] =
		useState<PaymentStatusFilter>('All Payment Status');
	const [duration, setDuration] = useState<DurationPreset>('All');
	const [campaign, setCampaign] = useState<string>('All Campaigns');
	const [agentId, setAgentId] = useState<string>('All Agents');
	const [teamId, setTeamId] = useState<string>('All Teams');
	const [deletedFilter, setDeletedFilter] =
		useState<DeletedLeadFilter>('active');
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);

	const currentRole = useSyncExternalStore(
		subscribeToCurrentUser,
		getCurrentRoleSnapshot,
		getServerRoleSnapshot,
	);
	const isAdmin = currentRole === UserRole.ADMIN;
	const canViewPaymentStatus =
		currentRole === UserRole.ADMIN || currentRole === UserRole.TEAM_LEAD;
	const canFilterAgents =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.TEAM_LEAD ||
		currentRole === UserRole.QUALITY_ASSURANCE;
	const [agents, setAgents] = useState<AgentListItem[]>([]);
	const [teams, setTeams] = useState<TeamOverviewItem[]>([]);


	useEffect(() => {
		async function loadCampaignOptions() {
			try {
				const response = await getCampaignOptionsApi();
				if (response.campaigns.length > 0) {
					setCampaignOptions(response.campaigns);
				}
			} catch {
				setCampaignOptions(CAMPAIGNS);
			}
		}

		loadCampaignOptions();
	}, []);

	useEffect(() => {
		if (canFilterAgents) {
			const fetchAgents = async () => {
				const response = await getAgentsApi();
				if (response.success && response.data) {
					setAgents(response.data);
				}
			};
			fetchAgents();
		}
	}, [canFilterAgents]);
	useEffect(() => {
		if (!isAdmin) return;

		async function loadTeams() {
			try {
				const data = await getTeamsApi({ page: 1, limit: 50 });
				setTeams(data.teams);
			} catch {
				setTeams([]);
			}
		}

		loadTeams();
	}, [isAdmin]);

	const fetchLeads = useCallback(async () => {
		setIsLoading(true);
		let startDate: Date | undefined;
		let endDate: Date | undefined;

		switch (duration) {
			case 'Today':
			case 'Yesterday':
			case 'Last 7 Days':
			case 'Week to Date':
			case 'Last 30 Days':
			case 'This Month':
			case 'Last Month': {
				const pacificRange = getPacificDateRangeForPreset(duration);
				startDate = pacificRange.startDate;
				endDate = pacificRange.endDate;
				break;
			}
			case 'Custom Range':
				if (customDateRange) {
					const pacificRange = getPacificDateRangeFromCalendarDates(
						customDateRange.start,
						customDateRange.end,
					);
					startDate = pacificRange.startDate;
					endDate = pacificRange.endDate;
				}
				break;
			default:
				startDate = undefined;
				endDate = undefined;
		}

		const response = await getLeadsApi({
			limit: 50,
			search: search || undefined,
			status: status === 'All Status' ? undefined : status,
			paymentStatus:
				canViewPaymentStatus && paymentStatus !== 'All Payment Status'
					? paymentStatus
					: undefined,
			startDate,
			endDate,
			campaign: campaign === 'All Campaigns' ? undefined : campaign,
			agentId: agentId === 'All Agents' ? undefined : agentId,
			teamId: isAdmin && teamId !== 'All Teams' ? teamId : undefined,
			deletedFilter: isAdmin ? deletedFilter : undefined,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Failed to fetch leads');
			setLeads([]);
			setIsLoading(false);
			return;
		}

		setLeads(response.data);
		setErrorMessage('');
		setIsLoading(false);
	}, [
		search,
		status,
		paymentStatus,
		canViewPaymentStatus,
		duration,
		customDateRange,
		campaign,
		agentId,
		teamId,
		deletedFilter,
		isAdmin,
	]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchLeads();
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [fetchLeads]);

	const resetFilters = () => {
		setSearch('');
		setStatus('All Status');
		setPaymentStatus('All Payment Status');
		setDuration('All');
		setCampaign('All Campaigns');
		setAgentId('All Agents');
		setTeamId('All Teams');
		setDeletedFilter('active');
		setCustomDateRange(null);
	};

	return {
		leads,
		isLoading,
		errorMessage,
		isAdmin,
		canFilterAgents,
		canViewPaymentStatus,
		agents,
		teams,
		campaignOptions,
		filters: {
			search,
			setSearch,
			status,
			setStatus,
			paymentStatus,
			setPaymentStatus,
			duration,
			setDuration,
			campaign,
			setCampaign,
			agentId,
			setAgentId,
			teamId,
			setTeamId,
			deletedFilter,
			setDeletedFilter,
			customDateRange,
			setCustomDateRange,
		},
		resetFilters,
		refresh: fetchLeads,
	};
}
