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
import { CAMPAIGNS } from '@/common/constants/campaigns';

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
	const canFilterAgents =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.TEAM_LEAD ||
		currentRole === UserRole.QUALITY_ASSURANCE;
	const [agents, setAgents] = useState<AgentListItem[]>([]);


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

	const fetchLeads = useCallback(async () => {
		setIsLoading(true);
		let startDate: Date | undefined;
		let endDate: Date | undefined;

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const endOfToday = new Date(today);
		endOfToday.setHours(23, 59, 59, 999);

		switch (duration) {
			case 'Today':
				startDate = today;
				break;
			case 'Yesterday':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 1);
				endDate = today;
				break;
			case 'Last 7 Days':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 7);
				break;
			case 'Week to Date': {
				const dayOfWeek = today.getDay();
				const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - daysSinceMonday);
				endDate = endOfToday;
				break;
			}
			case 'Last 30 Days':
				startDate = new Date(today);
				startDate.setDate(startDate.getDate() - 30);
				break;
			case 'This Month':
				startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				break;
			case 'Last Month':
				startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				endDate = new Date(now.getFullYear(), now.getMonth(), 0);
				break;
			case 'Custom Range':
				if (customDateRange) {
					startDate = customDateRange.start;
					endDate = customDateRange.end;
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
				paymentStatus === 'All Payment Status' ? undefined : paymentStatus,
			startDate,
			endDate,
			campaign: campaign === 'All Campaigns' ? undefined : campaign,
			agentId: agentId === 'All Agents' ? undefined : agentId,
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
		duration,
		customDateRange,
		campaign,
		agentId,
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
		setDeletedFilter('active');
		setCustomDateRange(null);
	};

	return {
		leads,
		isLoading,
		errorMessage,
		isAdmin,
		canFilterAgents,
		agents,
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
			deletedFilter,
			setDeletedFilter,
			customDateRange,
			setCustomDateRange,
		},
		resetFilters,
		refresh: fetchLeads,
	};
}





