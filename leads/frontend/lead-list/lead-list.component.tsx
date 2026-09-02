'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LeadCard } from '@/common/components/lead-card';
import { Pagination } from '@/common/components/pagination';
import { PAGE_SIZE_OPTIONS } from '@/common/constants/pagination';
import { DurationFilter } from './components/duration-filter.component';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import type { UserRole } from '@/common/constants/user-roles.enum';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import {
	useLeadListHook,
	type DeletedLeadFilter,
	type LeadStatusFilter,
	type LeadTypeFilter,
	type PaymentStatusFilter,
} from './lead-list.hook';
import type { BulkLeadAction } from './bulk-lead-action.api';

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

const BULK_ACTIONS: Array<{ label: string; value: BulkLeadAction }> = [
	{ label: 'Mark as Paid', value: 'mark_paid' },
	{ label: 'Mark as Unpaid', value: 'mark_unpaid' },
	{ label: 'Mark as Deleted', value: 'mark_deleted' },
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
		? `${agent.name} — ${getUserRoleLabel(agent.role)}`
		: agent.name;

	if (agent.status && agent.status !== 'active') {
		label += ` (${agent.status.charAt(0).toUpperCase()}${agent.status.slice(1)})`;
	}

	return label;
}

export function LeadList() {
	const {
		leads,
		isLoading,
		errorMessage,
		filters,
		resetFilters,
		isAdmin,
		isTeamLead,
		canFilterAgents,
		canViewPaymentStatus,
		agents,
		teams,
		campaignOptions,
		pagination,
		refresh,
		bulkActions,
	} = useLeadListHook();
	const [bulkActionSelectKey, setBulkActionSelectKey] = useState(0);

	async function handleBulkActionSelect(value: string) {
		await bulkActions.handleBulkAction(value as BulkLeadAction);
		setBulkActionSelectKey((current) => current + 1);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[32px]">
					Lead List
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

			<div className="flex flex-col gap-4 rounded-[19px] bg-white p-4 lg:min-h-[65px] lg:flex-row lg:items-center lg:justify-between lg:p-0 lg:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
					<div className="flex items-center gap-2 text-[#313957]">
						<Filter size={20} />
						<span className="text-[16px]">Filter</span>
					</div>

					<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
						<DurationFilter
							value={filters.duration}
							customDateRange={filters.customDateRange}
							onDurationChange={filters.setDuration}
							onCustomDateRangeChange={filters.setCustomDateRange}
						/>

						<Select
							value={filters.status}
							onValueChange={(value) => filters.setStatus(value as LeadStatus)}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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

						{canViewPaymentStatus && filters.status === LeadStatus.BILLABLE && (
							<Select
								value={filters.paymentStatus}
								onValueChange={(value) =>
									filters.setPaymentStatus(value as PaymentStatusFilter)
								}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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
						)}

						<Select
							value={filters.leadType}
							onValueChange={(value) =>
								filters.setLeadType(value as LeadTypeFilter)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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
						<Select
							value={filters.campaign}
							onValueChange={filters.setCampaign}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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

						{isAdmin && (
							<Select value={filters.teamId} onValueChange={filters.setTeamId}>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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
						)}
						{isAdmin && (
							<Select
								value={filters.deletedFilter}
								onValueChange={(value) =>
									filters.setDeletedFilter(value as DeletedLeadFilter)
								}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
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
						)}

						{canFilterAgents && (
							<Select
								value={filters.agentId}
								onValueChange={filters.setAgentId}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
									<SelectValue
										placeholder={isTeamLead ? 'All Members' : 'All Agents'}
									/>
								</SelectTrigger>
								<SelectContent className="rounded-[19px] border-none shadow-xl">
									{/* "All Agents" is the sentinel the leads API expects. */}
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
						)}
					</div>
				</div>

				<Button
					variant="ghost"
					className="h-auto p-0 text-[14px] text-[#4547D3] hover:bg-transparent hover:text-blue-700"
					onClick={resetFilters}
				>
					Reset All
				</Button>
			</div>

			{isAdmin ? (
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-3 rounded-[19px] bg-white p-3 lg:min-h-[58px] lg:flex-row lg:items-center lg:justify-between lg:px-6">
						<div className="flex items-center justify-between gap-3 lg:min-w-[260px]">
							<label className="flex min-w-0 items-center gap-3 text-[14px] font-medium text-[#2563EB]">
								<input
									type="checkbox"
									checked={bulkActions.allVisibleLeadsSelected}
									disabled={bulkActions.selectableCount === 0}
									onChange={bulkActions.toggleAllVisibleLeads}
									className="size-4 shrink-0 rounded border-[#D4D7E3] accent-[#2563EB]"
								/>
								<span className="truncate">Select All Billable Lead</span>
							</label>
							<span className="shrink-0 text-right text-[14px] font-medium text-[#2563EB] lg:hidden">
								{bulkActions.selectedCount} Lead Selected
							</span>
						</div>

						<div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end lg:flex-1">
							<span className="hidden text-[14px] font-medium text-[#2563EB] lg:inline">
								{bulkActions.selectedCount} Lead Selected
							</span>
							<Select
								key={bulkActionSelectKey}
								disabled={
									bulkActions.selectedCount === 0 || bulkActions.isBulkUpdating
								}
								onValueChange={handleBulkActionSelect}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 text-[15px] font-medium text-[#313957] data-[placeholder]:text-[#8897AD] sm:w-[170px] lg:border-none lg:bg-[#2563EB] lg:text-white lg:data-[placeholder]:text-white lg:[&_svg]:text-white">
									<SelectValue
										placeholder={
											bulkActions.isBulkUpdating ? 'Updating...' : 'Action'
										}
									/>
								</SelectTrigger>
								<SelectContent className="rounded-[12px] border-none shadow-xl">
									{BULK_ACTIONS.map((action) => (
										<SelectItem key={action.value} value={action.value}>
											{action.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								variant="ghost"
								className="h-[48px] rounded-[12px] bg-[#2563EB] px-4 text-[14px] font-medium text-white hover:bg-blue-700 hover:text-white disabled:bg-[#93A8EA] sm:h-auto sm:bg-transparent sm:p-0 sm:text-[#6B7A99] sm:hover:bg-transparent sm:hover:text-[#313957] sm:disabled:bg-transparent"
								disabled={bulkActions.selectedCount === 0}
								onClick={bulkActions.clearBulkSelection}
							>
								Cancel Selection
							</Button>
						</div>
					</div>
					{bulkActions.errorMessage ? (
						<p className="text-sm font-medium text-red-500">
							{bulkActions.errorMessage}
						</p>
					) : null}
					{bulkActions.successMessage ? (
						<p className="text-sm font-medium text-green-600">
							{bulkActions.successMessage}
						</p>
					) : null}
				</div>
			) : null}

			<div className="flex flex-1 flex-col gap-6 pb-10">
				{isLoading ? (
					<div className="flex h-40 items-center justify-center text-[#313957]">
						Loading leads...
					</div>
				) : errorMessage ? (
					<div className="flex h-40 items-center justify-center text-red-500">
						{errorMessage}
					</div>
				) : leads.length === 0 ? (
					<div className="flex h-40 items-center justify-center text-[#313957]">
						No leads found.
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{leads.map((lead) => (
							<LeadCard
								key={lead.id}
								lead={lead}
								onSoftDeleteSuccess={refresh}
								isSelectable={isAdmin && !lead.deletedAt}
								isSelected={bulkActions.selectedLeadIdSet.has(lead.id)}
								onSelectionChange={bulkActions.toggleLeadSelection}
							/>
						))}
					</div>
				)}

				{/* Kept mounted while refetching so it does not flicker on every
				    debounced filter change. */}
				{!errorMessage && pagination.total > 0 && (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						total={pagination.total}
						limit={pagination.limit}
						itemLabel="leads"
						onPageChange={pagination.setPage}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
						onPageSizeChange={pagination.setLimit}
						className="rounded-[19px] border-t-0"
					/>
				)}
			</div>
		</div>
	);
}
