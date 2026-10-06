'use client';

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from 'react';

import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { getCampaignOptionsApi } from '@/campaigns/frontend/campaign-options';
import { getTotalPages } from '@/common/components/pagination';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/common/constants/pagination';
import { UserRole } from '@/common/constants/user-roles.enum';
import {
	getPacificDateRangeForPreset,
	getPacificDateRangeFromCalendarDates,
} from '@/common/utils/pacific-time';
import { getTeamsApi } from '@/teams/frontend/team-overview';
import type { TeamOverviewItem } from '@/teams/backend/manage-teams/manage-teams.type';
import type { ReportRow } from '@/reports/backend/list-report';
import type {
	DeletedLeadFilter,
	DurationPreset,
	LeadStatusFilter,
	LeadTypeFilter,
	PaymentStatusFilter,
} from '@/leads/frontend/lead-list/lead-list.hook';
import { getReportApi } from './report-list.api';

const REPORT_CREATOR_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
];

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
	duration: DurationPreset,
	customDateRange: { start: Date; end?: Date } | null,
) {
	if (duration === 'All') {
		return { startDate: undefined, endDate: undefined };
	}

	if (duration === 'Custom Range') {
		return customDateRange
			? getPacificDateRangeFromCalendarDates(
					customDateRange.start,
					customDateRange.end,
				)
			: { startDate: undefined, endDate: undefined };
	}

	return getPacificDateRangeForPreset(duration);
}

function formatCsvValue(value: string | number) {
	const stringValue = String(value);
	return /[",\n]/.test(stringValue)
		? `"${stringValue.replace(/"/g, '""')}"`
		: stringValue;
}

function downloadCsv(rows: ReportRow[]) {
	const headers = ['User', 'Total Leads', 'Non Billable', 'Billable'];
	const csvRows = rows.map((row) =>
		[row.user.name, row.totalLeads, row.nonBillable, row.billable]
			.map(formatCsvValue)
			.join(','),
	);
	const csvContent = [headers.join(','), ...csvRows].join('\n');
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `lead-report-${new Date().toISOString().slice(0, 10)}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function useReportListHook() {
	const [rows, setRows] = useState<ReportRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloadError, setDownloadError] = useState('');

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
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);
	const [agents, setAgents] = useState<AgentListItem[]>([]);
	const [teams, setTeams] = useState<TeamOverviewItem[]>([]);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
	const [total, setTotal] = useState(0);

	const currentRole = useSyncExternalStore(
		subscribeToCurrentUser,
		getCurrentRoleSnapshot,
		getServerRoleSnapshot,
	);
	const isAdmin = currentRole === UserRole.ADMIN;
	const isTeamLead =
		currentRole === UserRole.TEAM_LEAD || currentRole === UserRole.MANAGER;
	const canViewPaymentStatus =
		currentRole === UserRole.ADMIN || currentRole === UserRole.MANAGER;
	const canFilterAgents =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.MANAGER ||
		currentRole === UserRole.TEAM_LEAD;
	const totalPages = useMemo(() => getTotalPages(total, limit), [total, limit]);

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
				setAgents(
					response.data.filter((agent) =>
						REPORT_CREATOR_ROLES.includes(agent.role),
					),
				);
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

	const buildInput = useCallback(
		(inputPage: number, inputLimit: number) => {
			const { startDate, endDate } = getDateRange(duration, customDateRange);

			return {
				page: inputPage,
				limit: inputLimit,
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
			};
		},
		[
			agentId,
			campaign,
			canViewPaymentStatus,
			customDateRange,
			deletedFilter,
			duration,
			isAdmin,
			leadType,
			paymentStatus,
			search,
			status,
			teamId,
		],
	);

	const fetchReport = useCallback(async () => {
		setIsLoading(true);
		const response = await getReportApi(buildInput(page, limit));

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Failed to fetch report');
			setRows([]);
			setTotal(0);
			setIsLoading(false);
			return;
		}

		if (response.data.length === 0 && page > 1) {
			setPage(1);
			return;
		}

		setRows(response.data);
		setTotal(response.total ?? response.data.length);
		setErrorMessage('');
		setIsLoading(false);
	}, [buildInput, limit, page]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchReport();
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [fetchReport]);

	function withPageReset<Value>(setValue: (value: Value) => void) {
		return (value: Value) => {
			setValue(value);
			setPage(1);
		};
	}

	function resetFilters() {
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
	}

	async function downloadReport() {
		setIsDownloading(true);
		setDownloadError('');
		const allRows: ReportRow[] = [];
		let downloadPage = 1;
		let totalRows = 0;

		do {
			const response = await getReportApi(
				buildInput(downloadPage, MAX_PAGE_SIZE),
			);

			if (!response.success || !response.data) {
				setDownloadError(response.error || 'Failed to download report');
				setIsDownloading(false);
				return;
			}

			allRows.push(...response.data);
			totalRows = response.total ?? allRows.length;
			downloadPage += 1;
		} while (allRows.length < totalRows);

		downloadCsv(allRows);
		setIsDownloading(false);
	}

	return {
		rows,
		isLoading,
		errorMessage,
		downloadError,
		isDownloading,
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
		downloadReport,
	};
}
