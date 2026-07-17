'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
	TeamLeadOption,
	TeamOverviewItem,
} from '@/teams/backend/manage-teams/manage-teams.type';
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
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	let startDate: Date | undefined;
	let endDate: Date | undefined;

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
		default:
			break;
	}

	return { startDate, endDate };
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
	const limit = 8;

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
		totalPages,
		isLoading,
		errorMessage,
	};
}