'use client';

import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useSyncExternalStore,
} from 'react';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';
import { getTotalPages } from '@/common/components/pagination';
import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';
import { getLeadsApi } from './lead-list.api';
import { resolveDurationRange } from './lead-list.function';
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
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
	const [total, setTotal] = useState(0);

	const totalPages = useMemo(() => getTotalPages(total, limit), [total, limit]);

	const currentRole = useSyncExternalStore(
		subscribeToCurrentUser,
		getCurrentRoleSnapshot,
		getServerRoleSnapshot,
	);
	const isAdmin = currentRole === UserRole.ADMIN;
	// Team leads filter across agents and loan officers; everyone else sees
	// agents only.
	const isTeamLead = currentRole === UserRole.TEAM_LEAD;
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
		const { startDate, endDate } = resolveDurationRange(
			duration,
			customDateRange,
		);

		const response = await getLeadsApi({
			page,
			limit,
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
			setTotal(0);
			setIsLoading(false);
			return;
		}

		// Deleting the last lead of a page can leave the user stranded past the
		// end of the list, so fall back to the first page.
		if (response.data.length === 0 && page > 1) {
			setPage(1);
			return;
		}

		setLeads(response.data);
		setTotal(response.total ?? response.data.length);
		setErrorMessage('');
		setIsLoading(false);
	}, [
		page,
		limit,
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

	// Every filter change invalidates the current page offset, so each setter is
	// wrapped to send the user back to the first page.
	function withPageReset<Value>(setValue: (value: Value) => void) {
		return (value: Value) => {
			setValue(value);
			setPage(1);
		};
	}

	const resetFilters = () => {
		setSearch('');
		setStatus('All Status');
		setPaymentStatus('All Payment Status');
		setDuration('All');
		setCampaign('All Campaigns');
		setAgentId('All Agents');
		setDeletedFilter('active');
		setCustomDateRange(null);
		setPage(1);
	};

	return {
		leads,
		isLoading,
		errorMessage,
		isAdmin,
		isTeamLead,
		canFilterAgents,
		agents,
		campaignOptions,
		filters: {
			search,
			setSearch: withPageReset(setSearch),
			status,
			setStatus: withPageReset(setStatus),
			paymentStatus,
			setPaymentStatus: withPageReset(setPaymentStatus),
			duration,
			setDuration: withPageReset(setDuration),
			campaign,
			setCampaign: withPageReset(setCampaign),
			agentId,
			setAgentId: withPageReset(setAgentId),
			deletedFilter,
			setDeletedFilter: withPageReset(setDeletedFilter),
			customDateRange,
			setCustomDateRange: withPageReset(setCustomDateRange),
		},
		pagination: {
			page,
			setPage,
			limit,
			setLimit: withPageReset(setLimit),
			total,
			totalPages,
		},
		resetFilters,
		refresh: fetchLeads,
	};
}
