'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, Filter, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/common/components/pagination';
import { DEFAULT_PAGE_SIZE } from '@/common/constants/pagination';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { getAgentsApi } from '@/agents/frontend/list-agents';
import type { AgentListItem } from '@/agents/backend/list-agents/list-agents.type';
import { DurationFilter } from '@/leads/frontend/lead-list/components/duration-filter.component';
import type { DurationPreset } from '@/leads/frontend/lead-list/lead-list.hook';
import {
	getPacificDateRangeForPreset,
	getPacificDateRangeFromCalendarDates,
} from '@/common/utils/pacific-time';
import { cn } from '@/lib/utils';
import type { ListedDispute } from '@/disputes/backend/list-disputes/list-disputes.type';
import { getDisputesApi } from './dispute-list.api';

const STATUSES: Array<{ label: string; value: DisputeStatus | 'All Status' }> =
	[
		{ label: 'All Status', value: 'All Status' },
		{ label: 'Unresolved', value: DisputeStatus.UNRESOLVED },
		{ label: 'Resolved', value: DisputeStatus.RESOLVED },
	];

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

function statusLabel(status: DisputeStatus) {
	return status === DisputeStatus.RESOLVED ? 'Resolved' : 'Unresolved';
}

function statusClass(status: DisputeStatus) {
	if (status === DisputeStatus.RESOLVED) return 'bg-[#D1FAE5] text-[#10B981]';
	return 'bg-[#FEF3C7] text-[#F59E0B]';
}

function StatCard({
	label,
	value,
	variant,
}: {
	label: string;
	value: number;
	variant: 'total' | 'unresolved' | 'resolved';
}) {
	const styles = {
		total: 'bg-[#EBF5FF] text-[#5A8FD9]',
		unresolved: 'bg-[#FFF7E8] text-[#F59E0B]',
		resolved: 'bg-[#E7FFF7] text-[#10B981]',
	}[variant];
	const Icon =
		variant === 'total' ? User : variant === 'unresolved' ? Clock : CheckCircle;

	return (
		<div
			className={cn(
				'flex min-h-[78px] items-center gap-4 rounded-[16px] px-6 shadow-sm',
				styles,
			)}
		>
			<div className="flex size-[46px] items-center justify-center rounded-full bg-white/45">
				<Icon className="size-7" />
			</div>
			<div>
				<div className="text-[28px] font-bold leading-none text-[#313957]">
					{String(value).padStart(2, '0')}
				</div>
				<div className="mt-1 text-[13px] font-semibold text-[#313957]">
					{label}
				</div>
			</div>
		</div>
	);
}

export function DisputeList() {
	const router = useRouter();
	const [disputes, setDisputes] = useState<ListedDispute[]>([]);
	const [agents, setAgents] = useState<AgentListItem[]>([]);
	const [stats, setStats] = useState({ total: 0, unresolved: 0, resolved: 0 });
	const [duration, setDuration] = useState<DurationPreset>('All');
	const [customDateRange, setCustomDateRange] = useState<{
		start: Date;
		end?: Date;
	} | null>(null);
	const [status, setStatus] = useState<DisputeStatus | 'All Status'>(
		'All Status',
	);
	const [createdById, setCreatedById] = useState('All Agents');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(total / limit)),
		[limit, total],
	);

	useEffect(() => {
		async function loadAgents() {
			const response = await getAgentsApi();
			if (response.success && response.data) setAgents(response.data);
		}

		void loadAgents();
	}, []);

	const fetchDisputes = useCallback(async () => {
		setIsLoading(true);
		let startDate: Date | undefined;
		let endDate: Date | undefined;

		if (duration === 'Custom Range' && customDateRange) {
			const range = getPacificDateRangeFromCalendarDates(
				customDateRange.start,
				customDateRange.end,
			);
			startDate = range.startDate;
			endDate = range.endDate;
		} else if (duration !== 'All' && duration !== 'Custom Range') {
			const range = getPacificDateRangeForPreset(duration);
			startDate = range.startDate;
			endDate = range.endDate;
		}

		const response = await getDisputesApi({
			page,
			limit,
			startDate,
			endDate,
			status: status === 'All Status' ? undefined : status,
			createdById: createdById === 'All Agents' ? undefined : createdById,
		});

		if (!response.success || !response.data) {
			setErrorMessage(response.error || 'Failed to fetch disputes');
			setDisputes([]);
			setTotal(0);
			setIsLoading(false);
			return;
		}

		setDisputes(response.data);
		setStats(response.stats || { total: 0, unresolved: 0, resolved: 0 });
		setTotal(response.total || 0);
		setErrorMessage('');
		setIsLoading(false);
	}, [createdById, customDateRange, duration, limit, page, status]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void fetchDisputes();
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, [fetchDisputes]);

	function resetFilters() {
		setDuration('All');
		setCustomDateRange(null);
		setStatus('All Status');
		setCreatedById('All Agents');
		setPage(1);
	}

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[32px]">
				Disputes
			</h1>

			<div className="grid grid-cols-1 gap-4 rounded-[20px] bg-white/70 p-6 md:grid-cols-3">
				<StatCard label="Total Disputes" value={stats.total} variant="total" />
				<StatCard
					label="Unresolved"
					value={stats.unresolved}
					variant="unresolved"
				/>
				<StatCard label="Resolved" value={stats.resolved} variant="resolved" />
			</div>

			<div className="flex justify-end gap-3">
				<Button
					type="button"
					variant="ghost"
					onClick={resetFilters}
					className="text-[#2563EB]"
				>
					Reset All
				</Button>
				<Button
					type="button"
					variant="outline"
					className="gap-2 rounded-[8px] border-[#D4D7E3] bg-white px-5 text-[#313957]"
				>
					<Filter className="size-4" /> Filter
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 rounded-[19px] bg-white p-5 lg:grid-cols-[auto_1fr_auto_1fr] lg:items-center">
				<label className="text-[14px] font-medium text-[#313957]">
					Duration:
				</label>
				<DurationFilter
					value={duration}
					customDateRange={customDateRange}
					onDurationChange={(value) => {
						setDuration(value);
						setPage(1);
					}}
					onCustomDateRangeChange={(value) => {
						setCustomDateRange(value);
						setPage(1);
					}}
				/>

				<label className="text-[14px] font-medium text-[#313957]">
					Status:
				</label>
				<Select
					value={status}
					onValueChange={(value) => {
						setStatus(value as DisputeStatus | 'All Status');
						setPage(1);
					}}
				>
					<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white px-4">
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent>
						{STATUSES.map((item) => (
							<SelectItem key={item.value} value={item.value}>
								{item.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<label className="text-[14px] font-medium text-[#313957]">
					Created by:
				</label>
				<Select
					value={createdById}
					onValueChange={(value) => {
						setCreatedById(value);
						setPage(1);
					}}
				>
					<SelectTrigger className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:col-span-3">
						<SelectValue placeholder="Agents" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="All Agents">All Agents</SelectItem>
						{agents.map((agent) => (
							<SelectItem key={agent.id} value={agent.id}>
								{agent.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Card className="overflow-hidden rounded-[19px] border-none bg-white p-0 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[760px] text-left text-[14px]">
						<thead className="bg-[#F1F5FB] text-[#0C1421]">
							<tr>
								<th className="px-8 py-5 font-semibold">Agent</th>
								<th className="px-8 py-5 font-semibold">Loan Officer</th>
								<th className="px-8 py-5 font-semibold">Status</th>
								<th className="px-8 py-5 font-semibold">Created On</th>
								<th className="px-8 py-5 font-semibold">Action</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								<tr>
									<td className="px-8 py-8 text-[#8897AD]" colSpan={5}>
										Loading disputes...
									</td>
								</tr>
							) : disputes.length === 0 ? (
								<tr>
									<td className="px-8 py-8 text-[#8897AD]" colSpan={5}>
										{errorMessage || 'No disputes found.'}
									</td>
								</tr>
							) : (
								disputes.map((dispute) => (
									<tr key={dispute.id} className="border-t border-[#D4D7E3]">
										<td className="px-8 py-4 font-medium text-[#0C1421]">
											{dispute.agent.name}
										</td>
										<td className="px-8 py-4 font-medium text-[#0C1421]">
											{dispute.loanOfficer.name}
										</td>
										<td className="px-8 py-4">
											<span
												className={cn(
													'rounded-full px-3 py-1 text-[12px] font-medium',
													statusClass(dispute.status),
												)}
											>
												{statusLabel(dispute.status)}
											</span>
										</td>
										<td className="px-8 py-4 font-medium text-[#0C1421]">
											{formatDate(dispute.createdAt)}
										</td>
										<td className="px-8 py-4">
											<Button
												type="button"
												onClick={() => router.push('/disputes/' + dispute.id)}
												className="h-[36px] rounded-[6px] bg-[#2563EB] px-6 text-white"
											>
												Review
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<Pagination
					page={page}
					totalPages={totalPages}
					total={total}
					limit={limit}
					itemLabel="disputes"
					onPageChange={setPage}
					onPageSizeChange={(value) => {
						setLimit(value);
						setPage(1);
					}}
					pageSizeOptions={[10, 25, 50]}
				/>
			</Card>
		</div>
	);
}
