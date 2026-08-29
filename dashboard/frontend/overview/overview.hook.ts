'use client';

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from 'react';
import type { DashboardData } from '@/dashboard/backend/lead-analytics/lead-analytics.type';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';
import { getCampaignOptionsApi } from '@/campaigns/frontend/campaign-options';
import { getTeamsApi } from '@/teams/frontend/team-overview';
import type { TeamOverviewItem } from '@/teams/backend/manage-teams/manage-teams.type';
import {
	getPacificDateRangeForPreset,
	getPacificDateRangeFromCalendarDates,
} from '@/common/utils/pacific-time';
import { getDashboardDataApi } from './get-dashboard-data.api';

export type DashboardDurationPreset =
	| 'Today'
	| 'Yesterday'
	| 'Last 7 Days'
	| 'Week to Date'
	| 'Last 30 Days'
	| 'This Month'
	| 'Last Month'
	| 'All'
	| 'Custom Range';

export type DashboardLeadStatusFilter = LeadStatus | 'All Status';
export type DashboardPaymentStatusFilter =
	| 'paid'
	| 'unpaid'
	| 'All Payment Status';
export type DashboardLeadTypeFilter =
	| 'All Lead Types'
	| 'standard'
	| 'call_transfer';
export type DashboardDeletedLeadFilter = 'active' | 'deleted' | 'all';

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

function getDateRange(
	duration: DashboardDurationPreset,
	customDateRange: {
		start: Date;
		end?: Date;
	} | null,
) {
	switch (duration) {
		case 'Today':
		case 'Yesterday':
		case 'Last 7 Days':
		case 'Week to Date':
		case 'Last 30 Days':
		case 'This Month':
		case 'Last Month':
			return getPacificDateRangeForPreset(duration);
		case 'Custom Range':
			return customDateRange
				? getPacificDateRangeFromCalendarDates(
						customDateRange.start,
						customDateRange.end,
					)
				: { startDate: undefined, endDate: undefined };
		default:
			return { startDate: undefined, endDate: undefined };
	}
}

export function useOverviewHook() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [currentUserName] = useState(() => {
		const currentUserInformation = getCurrentLoggedInUserInformation();
		return currentUserInformation?.currentUser.name || 'User';
	});
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [status, setStatus] =
		useState<DashboardLeadStatusFilter>('All Status');
	const [paymentStatus, setPaymentStatus] =
		useState<DashboardPaymentStatusFilter>('All Payment Status');
	const [duration, setDuration] = useState<DashboardDurationPreset>('All');
	const [campaign, setCampaign] = useState<string>('All Campaigns');
	const [agentId, setAgentId] = useState<string>('All Agents');
	const [teamId, setTeamId] = useState<string>('All Teams');
	const [deletedFilter, setDeletedFilter] =
		useState<DashboardDeletedLeadFilter>('active');
	const [leadType, setLeadType] =
		useState<DashboardLeadTypeFilter>('All Lead Types');
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);
	const [agents, setAgents] = useState<AgentListItem[]>([]);
	const [teams, setTeams] = useState<TeamOverviewItem[]>([]);

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
		if (!canFilterAgents) return;

		async function loadAgents() {
			const response = await getAgentsApi();
			if (response.success && response.data) {
				setAgents(response.data);
			}
		}

		loadAgents();
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

	const fetchDashboardData = useCallback(async () => {
		setIsLoading(true);
		const { startDate, endDate } = getDateRange(duration, customDateRange);
		const response = await getDashboardDataApi({
			startDate,
			endDate,
			status: status === 'All Status' ? undefined : status,
			paymentStatus:
				canViewPaymentStatus && paymentStatus !== 'All Payment Status'
					? paymentStatus
					: undefined,
			campaign: campaign === 'All Campaigns' ? undefined : campaign,
			agentId: agentId === 'All Agents' ? undefined : agentId,
			teamId: isAdmin && teamId !== 'All Teams' ? teamId : undefined,
			deletedFilter: isAdmin ? deletedFilter : undefined,
			leadType: leadType === 'All Lead Types' ? undefined : leadType,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Unable to load dashboard');
			setData(null);
			setIsLoading(false);
			return;
		}

		setData(response.data);
		setErrorMessage('');
		setIsLoading(false);
	}, [
		duration,
		customDateRange,
		status,
		paymentStatus,
		canViewPaymentStatus,
		campaign,
		agentId,
		teamId,
		deletedFilter,
		leadType,
		isAdmin,
	]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchDashboardData();
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [fetchDashboardData]);

	const filters = useMemo(
		() => ({
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
			leadType,
			setLeadType,
			customDateRange,
			setCustomDateRange,
		}),
		[
			status,
			paymentStatus,
			duration,
			campaign,
			agentId,
			teamId,
			deletedFilter,
			leadType,
			customDateRange,
		],
	);

	const resetFilters = () => {
		setStatus('All Status');
		setPaymentStatus('All Payment Status');
		setDuration('All');
		setCampaign('All Campaigns');
		setAgentId('All Agents');
		setTeamId('All Teams');
		setDeletedFilter('active');
		setLeadType('All Lead Types');
		setCustomDateRange(null);
	};

	return {
		data,
		currentUserName,
		isLoading,
		errorMessage,
		isAdmin,
		canFilterAgents,
		canViewPaymentStatus,
		agents,
		teams,
		campaignOptions,
		filters,
		resetFilters,
	};
}
