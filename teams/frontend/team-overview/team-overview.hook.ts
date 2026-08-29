'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';
import type {
	TeamLeadOption,
	TeamOverviewItem,
} from '@/teams/backend/manage-teams/manage-teams.type';
import { getPacificDateRangeForPreset } from '@/common/utils/pacific-time';
import { getTeamsApi } from './team-overview.api';

export type TeamDurationPreset =
	| 'Today'
	| 'Yesterday'
	| 'Last 7 Days'
	| 'Last 30 Days'
	| 'This Month'
	| 'Last Month'
	| 'All';

export type TeamStatusFilter = 'all' | 'active' | 'inactive';

function getDurationRange(duration: TeamDurationPreset) {
	if (duration === 'All') {
		return { startDate: undefined, endDate: undefined };
	}

	return getPacificDateRangeForPreset(duration);
}

export function useTeamOverviewHook() {
	const [teams, setTeams] = useState<TeamOverviewItem[]>([]);
	const [teamLeads, setTeamLeads] = useState<TeamLeadOption[]>([]);
	const [search, setSearch] = useState('');
	const [duration, setDuration] = useState<TeamDurationPreset>('All');
	const [status, setStatus] = useState<TeamStatusFilter>('all');
	const [teamLeadId, setTeamLeadId] = useState('all');
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		billable: 0,
		nonBillable: 0,
	});
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / limit)),
		[total, limit],
	);

	const loadTeams = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const { startDate, endDate } = getDurationRange(duration);
			const data = await getTeamsApi({
				search,
				status,
				teamLeadId,
				startDate,
				endDate,
				page,
				limit,
			});
			setTeams(data.teams);
			setStats(data.stats);
			setTeamLeads(data.teamLeads);
			setTotal(data.total);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : 'Unable to load teams',
			);
		} finally {
			setIsLoading(false);
		}
	}, [duration, limit, page, search, status, teamLeadId]);

	useEffect(() => {
		loadTeams();
	}, [loadTeams]);

	const resetFilters = () => {
		setDuration('All');
		setStatus('all');
		setTeamLeadId('all');
		setPage(1);
	};

	return {
		teams,
		teamLeads,
		stats,
		search,
		setSearch: (value: string) => {
			setSearch(value);
			setPage(1);
		},
		duration,
		setDuration: (value: TeamDurationPreset) => {
			setDuration(value);
			setPage(1);
		},
		status,
		setStatus: (value: TeamStatusFilter) => {
			setStatus(value);
			setPage(1);
		},
		teamLeadId,
		setTeamLeadId: (value: string) => {
			setTeamLeadId(value);
			setPage(1);
		},
		resetFilters,
		page,
		setPage,
		total,
		limit,
		setLimit: (value: number) => {
			setLimit(value);
			setPage(1);
		},
		totalPages,
		isLoading,
		errorMessage,
	};
}
