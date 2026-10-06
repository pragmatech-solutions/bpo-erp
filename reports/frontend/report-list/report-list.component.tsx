'use client';

import { Download, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/common/components/pagination';
import { PAGE_SIZE_OPTIONS } from '@/common/constants/pagination';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import type { UserRole } from '@/common/constants/user-roles.enum';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import { DurationFilter } from '@/leads/frontend/lead-list/components/duration-filter.component';
import type {
	DeletedLeadFilter,
	LeadStatusFilter,
	LeadTypeFilter,
	PaymentStatusFilter,
} from '@/leads/frontend/lead-list/lead-list.hook';
import { useReportListHook } from './report-list.hook';

const STATUSES: LeadStatusFilter[] = [
	'All Status',
	LeadStatus.BILLABLE,
	LeadStatus.NON_BILLABLE,
	LeadStatus.PENDING,
];

const PAYMENT_STATUSES: PaymentStatusFilter[] = [
	'All Payment Status',
	'paid',
	'unpaid',
];

const LEAD_TYPES: Array<{ label: string; value: LeadTypeFilter }> = [
	{ label: 'All Lead Types', value: 'All Lead Types' },
	{ label: 'Call Transfer', value: 'call_transfer' },
	{ label: 'Standard Leads', value: 'standard' },
];

const DELETED_FILTERS: Array<{ label: string; value: DeletedLeadFilter }> = [
	{ label: 'Active Leads', value: 'active' },
	{ label: 'Deleted Leads', value: 'deleted' },
	{ label: 'All Leads', value: 'all' },
];

function formatStatusLabel(status: LeadStatusFilter) {
	if (status === 'All Status') return status;

	return status
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function formatAgentFilterLabel(
	agent: {
		name: string;
		role: UserRole;
		status?: string;
	},
	isTeamLead: boolean,
) {
	let label = isTeamLead
		? `${agent.name} - ${getUserRoleLabel(agent.role)}`
		: agent.name;

	if (agent.status && agent.status !== 'active') {
		label += ` (${agent.status.charAt(0).toUpperCase()}${agent.status.slice(1)})`;
	}

	return label;
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function ReportList() {
	const {
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
		filters,
		pagination,
		resetFilters,
		downloadReport,
	} = useReportListHook();

	return (
		<div className="flex flex-col gap-6 pb-10">
			<div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[32px]">
					Report
				</h1>
				<div className="relative w-full lg:w-[344px]">
					<Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#313957]" />
					<Input
						placeholder="Search"
						className="h-[55px] rounded-[19px] border-none bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-1 focus-visible:ring-blue-400"
						value={filters.search}
						onChange={(event) => filters.setSearch(event.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-[19px] bg-white p-4 lg:px-6">
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-2 text-[#313957]">
						<Filter size={20} />
						<span className="text-[16px]">Filter</span>
					</div>
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							className="h-auto p-0 text-[14px] text-[#4547D3] hover:bg-transparent hover:text-blue-700"
							onClick={resetFilters}
						>
							Reset All
						</Button>
						<Button
							className="h-[44px] gap-2 rounded-[12px] bg-[#16A34A] px-4 text-white hover:bg-[#15803D]"
							disabled={isDownloading || pagination.total === 0}
							onClick={downloadReport}
						>
							<Download size={16} />
							{isDownloading ? 'Downloading...' : 'Download'}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					<DurationFilter
						value={filters.duration}
						customDateRange={filters.customDateRange}
						onDurationChange={filters.setDuration}
						onCustomDateRangeChange={filters.setCustomDateRange}
					/>

					<Select
						value={filters.status}
						onValueChange={(value) =>
							filters.setStatus(value as LeadStatusFilter)
						}
					>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
							<SelectValue placeholder="All Status" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							{STATUSES.map((status) => (
								<SelectItem key={status} value={status}>
									{formatStatusLabel(status)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{canViewPaymentStatus && filters.status === LeadStatus.BILLABLE ? (
						<Select
							value={filters.paymentStatus}
							onValueChange={(value) =>
								filters.setPaymentStatus(value as PaymentStatusFilter)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
								<SelectValue placeholder="All Payment Status" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{PAYMENT_STATUSES.map((paymentStatus) => (
									<SelectItem key={paymentStatus} value={paymentStatus}>
										{paymentStatus === 'All Payment Status'
											? paymentStatus
											: paymentStatus.charAt(0).toUpperCase() +
												paymentStatus.slice(1)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}

					<Select
						value={filters.leadType}
						onValueChange={(value) =>
							filters.setLeadType(value as LeadTypeFilter)
						}
					>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
							<SelectValue placeholder="All Lead Types" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							{LEAD_TYPES.map((leadType) => (
								<SelectItem key={leadType.value} value={leadType.value}>
									{leadType.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={filters.campaign} onValueChange={filters.setCampaign}>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
							<SelectValue placeholder="All Campaigns" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							<SelectItem value="All Campaigns">All Campaigns</SelectItem>
							{campaignOptions.map((campaign) => (
								<SelectItem key={campaign} value={campaign}>
									{campaign}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{isAdmin ? (
						<Select value={filters.teamId} onValueChange={filters.setTeamId}>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
								<SelectValue placeholder="All Teams" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								<SelectItem value="All Teams">All Teams</SelectItem>
								{teams.map((team) => (
									<SelectItem key={team.id} value={team.id}>
										{team.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}

					{isAdmin ? (
						<Select
							value={filters.deletedFilter}
							onValueChange={(value) =>
								filters.setDeletedFilter(value as DeletedLeadFilter)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
								<SelectValue placeholder="Active Leads" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{DELETED_FILTERS.map((filter) => (
									<SelectItem key={filter.value} value={filter.value}>
										{filter.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}

					{canFilterAgents ? (
						<Select value={filters.agentId} onValueChange={filters.setAgentId}>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4">
								<SelectValue
									placeholder={isTeamLead ? 'All Members' : 'All Agents'}
								/>
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								<SelectItem value="All Agents">
									{isTeamLead ? 'All Members' : 'All Agents'}
								</SelectItem>
								{agents.map((agent) => (
									<SelectItem key={agent.id} value={agent.id}>
										{formatAgentFilterLabel(agent, isTeamLead)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}
				</div>
			</div>

			{downloadError ? (
				<p className="text-sm font-medium text-red-500">{downloadError}</p>
			) : null}

			<div className="overflow-hidden rounded-[19px] bg-white shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[720px] border-collapse text-left">
						<thead className="bg-[#F1F5F9] text-[13px] font-semibold text-[#0C1421]">
							<tr>
								<th className="px-6 py-5">User</th>
								<th className="px-6 py-5">Total Leads</th>
								<th className="px-6 py-5">Non Billable</th>
								<th className="px-6 py-5">Billable</th>
							</tr>
						</thead>
						<tbody className="text-[14px] text-[#0C1421]">
							{isLoading ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-12 text-center text-[#313957]"
									>
										Loading report...
									</td>
								</tr>
							) : errorMessage ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-12 text-center text-red-500"
									>
										{errorMessage}
									</td>
								</tr>
							) : rows.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-12 text-center text-[#313957]"
									>
										No report data found.
									</td>
								</tr>
							) : (
								rows.map((row) => (
									<tr key={row.user.id} className="border-t border-[#D4D7E3]">
										<td className="px-6 py-4">
											<div className="flex min-w-0 items-center gap-3">
												<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#C4B5FD] text-[12px] font-semibold text-[#424290]">
													{getInitials(row.user.name)}
												</div>
												<span className="break-words font-medium">
													{row.user.name}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 font-medium">{row.totalLeads}</td>
										<td className="px-6 py-4 font-medium text-[#F43F5E]">
											{row.nonBillable}
										</td>
										<td className="px-6 py-4 font-medium text-[#10B981]">
											{row.billable}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{!errorMessage && pagination.total > 0 ? (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						total={pagination.total}
						limit={pagination.limit}
						itemLabel="users"
						onPageChange={pagination.setPage}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
						onPageSizeChange={pagination.setLimit}
					/>
				) : null}
			</div>
		</div>
	);
}
