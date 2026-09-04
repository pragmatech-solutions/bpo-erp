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
import {
	bulkUpdateLeadsApi,
	type BulkLeadAction,
} from './bulk-lead-action.api';
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
export type LeadTypeFilter = 'All Lead Types' | 'standard' | 'call_transfer';
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
	const [leadType, setLeadType] = useState<LeadTypeFilter>('All Lead Types');
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
	const [total, setTotal] = useState(0);
	const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
	const [bulkActionError, setBulkActionError] = useState('');
	const [bulkActionMessage, setBulkActionMessage] = useState('');
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);

	const totalPages = useMemo(() => getTotalPages(total, limit), [total, limit]);
	const selectableLeads = useMemo(
		() => leads.filter((lead) => !lead.deletedAt),
		[leads],
	);
	const visibleBillableLeads = useMemo(
		() => selectableLeads.filter((lead) => lead.status === LeadStatus.BILLABLE),
		[selectableLeads],
	);
	const selectedLeadIdSet = useMemo(
		() => new Set(selectedLeadIds),
		[selectedLeadIds],
	);
	const allVisibleLeadsSelected =
		visibleBillableLeads.length > 0 &&
		visibleBillableLeads.every((lead) => selectedLeadIdSet.has(lead.id));

	const currentRole = useSyncExternalStore(
		subscribeToCurrentUser,
		getCurrentRoleSnapshot,
		getServerRoleSnapshot,
	);
	const isAdmin = currentRole === UserRole.ADMIN;
	const canViewPaymentStatus =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.MANAGER ||
		currentRole === UserRole.TEAM_LEAD;
	// Team leads filter across agents and loan officers; everyone else sees
	// agents only.
	const isTeamLead =
		currentRole === UserRole.TEAM_LEAD || currentRole === UserRole.MANAGER;
	const canFilterAgents =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.MANAGER ||
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
			page,
			limit,
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
			leadType: leadType === 'All Lead Types' ? undefined : leadType,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Failed to fetch leads');
			setLeads([]);
			setTotal(0);
			setIsLoading(false);
			return;
		}

		const fetchedLeads = response.data;

		// Deleting the last lead of a page can leave the user stranded past the
		// end of the list, so fall back to the first page.
		if (fetchedLeads.length === 0 && page > 1) {
			setPage(1);
			return;
		}

		setSelectedLeadIds((current) =>
			current.filter((leadId) =>
				fetchedLeads.some((lead) => lead.id === leadId && !lead.deletedAt),
			),
		);
		setLeads(fetchedLeads);
		setTotal(response.total ?? fetchedLeads.length);
		setErrorMessage('');
		setIsLoading(false);
	}, [
		page,
		limit,
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
		leadType,
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
		setTeamId('All Teams');
		setDeletedFilter('active');
		setLeadType('All Lead Types');
		setCustomDateRange(null);
		setPage(1);
	};

	function clearBulkSelection() {
		setSelectedLeadIds([]);
		setBulkActionError('');
		setBulkActionMessage('');
	}

	function toggleLeadSelection(leadId: string, isSelected: boolean) {
		setBulkActionError('');
		setBulkActionMessage('');
		setSelectedLeadIds((current) => {
			if (isSelected) return Array.from(new Set([...current, leadId]));
			return current.filter((id) => id !== leadId);
		});
	}

	function toggleAllVisibleLeads() {
		setBulkActionError('');
		setBulkActionMessage('');
		const visibleLeadIds = visibleBillableLeads.map((lead) => lead.id);

		setSelectedLeadIds((current) => {
			if (allVisibleLeadsSelected) {
				return current.filter((id) => !visibleLeadIds.includes(id));
			}

			return Array.from(new Set([...current, ...visibleLeadIds]));
		});
	}

	async function handleBulkAction(action: BulkLeadAction) {
		setBulkActionError('');
		setBulkActionMessage('');

		if (!isAdmin) {
			setBulkActionError('Only admins can update leads in bulk');
			return;
		}

		if (selectedLeadIds.length === 0) {
			setBulkActionError('Select at least one lead');
			return;
		}

		const selectedLeads = leads.filter((lead) =>
			selectedLeadIdSet.has(lead.id),
		);
		const isPaymentAction = action === 'mark_paid' || action === 'mark_unpaid';

		if (
			isPaymentAction &&
			selectedLeads.some((lead) => lead.status !== LeadStatus.BILLABLE)
		) {
			setBulkActionError('Only billable leads can be marked paid or unpaid');
			return;
		}

		const actionLabel =
			action === 'mark_paid'
				? 'paid'
				: action === 'mark_unpaid'
					? 'unpaid'
					: 'deleted';

		if (
			!confirm(
				`Mark ${selectedLeadIds.length} selected lead(s) as ${actionLabel}?`,
			)
		) {
			return;
		}

		setIsBulkUpdating(true);
		const response = await bulkUpdateLeadsApi({
			leadIds: selectedLeadIds,
			action,
		});

		if (response.success) {
			setSelectedLeadIds([]);
			setBulkActionMessage(response.message);
			await fetchLeads();
		} else {
			setBulkActionError(response.error || 'Failed to update selected leads');
		}

		setIsBulkUpdating(false);
	}

	return {
		leads,
		isLoading,
		errorMessage,
		isAdmin,
		isTeamLead,
		canFilterAgents,
		canViewPaymentStatus,
		agents,
		teams,
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
			teamId,
			setTeamId: withPageReset(setTeamId),
			deletedFilter,
			setDeletedFilter: withPageReset(setDeletedFilter),
			leadType,
			setLeadType: withPageReset(setLeadType),
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
		bulkActions: {
			selectedLeadIds,
			selectedLeadIdSet,
			selectedCount: selectedLeadIds.length,
			selectableCount: visibleBillableLeads.length,
			allVisibleLeadsSelected,
			isBulkUpdating,
			errorMessage: bulkActionError,
			successMessage: bulkActionMessage,
			toggleLeadSelection,
			toggleAllVisibleLeads,
			clearBulkSelection,
			handleBulkAction,
		},
	};
}
