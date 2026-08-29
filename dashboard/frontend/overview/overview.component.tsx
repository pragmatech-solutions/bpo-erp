'use client';

import { AlertCircle, CheckCircle2, Clock3, Filter, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { DurationFilter } from '@/leads/frontend/lead-list/components/duration-filter.component';
import {
	useOverviewHook,
	type DashboardDeletedLeadFilter,
	type DashboardLeadStatusFilter,
	type DashboardPaymentStatusFilter,
} from './overview.hook';

const STATUSES: DashboardLeadStatusFilter[] = [
	'All Status',
	LeadStatus.BILLABLE,
	LeadStatus.NON_BILLABLE,
	LeadStatus.PENDING,
];

const PAYMENT_STATUSES: DashboardPaymentStatusFilter[] = [
	'All Payment Status',
	'paid',
	'unpaid',
];

const DELETED_FILTERS: Array<{
	label: string;
	value: DashboardDeletedLeadFilter;
}> = [
	{ label: 'Active Leads', value: 'active' },
	{ label: 'Deleted Leads', value: 'deleted' },
	{ label: 'All Leads', value: 'all' },
];

function formatStatusLabel(status: string) {
	return status
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function formatMemberFilterLabel(member: { name: string; status?: string }) {
	if (!member.status || member.status === 'active') return member.name;

	return `${member.name} (${formatStatusLabel(member.status)})`;
}

export function Overview() {
	const {
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
	} = useOverviewHook();

	if (isLoading && !data) {
		return <div className="text-[#313957]">Loading dashboard...</div>;
	}
	if (errorMessage) return <div className="text-red-500">{errorMessage}</div>;
	if (!data) return <div className="text-[#313957]">No data available.</div>;

	const statCards = [
		{
			label: 'Total',
			value: data.analytics.total,
			color: 'bg-[#EBF5FF]',
			icon: <User className="text-[#6A90CC]" />,
		},
		{
			label: 'Pending',
			value: data.analytics.pending,
			color: 'bg-[#FFF7EC]',
			icon: <Clock3 className="text-[#F59E0B]" />,
		},
		{
			label: 'Billable',
			value: data.analytics.billable,
			color: 'bg-[#E8FFF9]',
			icon: <CheckCircle2 className="text-[#10B981]" />,
		},
		{
			label: 'Non-Billable',
			value: data.analytics.nonBillable,
			color: 'bg-[#FFEDF0]',
			icon: <AlertCircle className="text-[#F43F5E]" />,
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[48px]">
				Dashboard
			</h1>
			<div className="rounded-[24px] bg-[#F7FBFF] p-6 lg:p-8">
				<div className="mb-5">
					<p className="text-[24px] font-medium text-[#313957] lg:text-[36px]">
						Good Morning, {currentUserName}
					</p>
					<p className="text-[18px] font-medium text-[#313957] lg:text-[24px]">
						Here&apos;s an overview of your performance.
					</p>
				</div>
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{statCards.map((card) => (
						<Card
							key={card.label}
							className={`rounded-[24px] border-none p-5 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] ${card.color}`}
						>
							<div className="flex items-center gap-3 lg:gap-4">
								<div className="flex size-[48px] items-center justify-center rounded-full bg-white/40 lg:size-[68px]">
									{card.icon}
								</div>
								<div>
									<div className="text-[30px] font-semibold leading-none text-[#313957] lg:text-[40px]">
										{String(card.value).padStart(2, '0')}
									</div>
									<div className="text-[14px] font-semibold text-[#313957] lg:text-[16px]">
										{card.label === 'Total' ? 'Total Leads' : card.label}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-4 rounded-[19px] bg-white p-4 lg:min-h-[65px] lg:flex-row lg:items-center lg:justify-between lg:p-0 lg:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
					<div className="flex items-center gap-2 text-[#313957]">
						<Filter size={20} />
						<span className="text-[16px]">Filter</span>
					</div>

					<div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
						<DurationFilter
							value={filters.duration}
							customDateRange={filters.customDateRange}
							onDurationChange={filters.setDuration}
							onCustomDateRangeChange={filters.setCustomDateRange}
						/>

						<Select
							value={filters.status}
							onValueChange={(value) =>
								filters.setStatus(value as DashboardLeadStatusFilter)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
								<SelectValue placeholder="All Status" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{STATUSES.map((status) => (
									<SelectItem key={status} value={status}>
										{status === 'All Status'
											? status
											: formatStatusLabel(status)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{canViewPaymentStatus && filters.status === LeadStatus.BILLABLE && (
							<Select
								value={filters.paymentStatus}
								onValueChange={(value) =>
									filters.setPaymentStatus(
										value as DashboardPaymentStatusFilter,
									)
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
												: formatStatusLabel(paymentStatus)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

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
									filters.setDeletedFilter(value as DashboardDeletedLeadFilter)
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
							<Select value={filters.agentId} onValueChange={filters.setAgentId}>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
									<SelectValue placeholder="All Agents" />
								</SelectTrigger>
								<SelectContent className="rounded-[19px] border-none shadow-xl">
									<SelectItem value="All Agents">All Agents</SelectItem>
									{agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{formatMemberFilterLabel(agent)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3">
					{isLoading && (
						<span className="text-[13px] text-[#8897AD]">Updating...</span>
					)}
					<Button
						variant="ghost"
						className="h-auto p-0 text-[14px] text-[#4547D3] hover:bg-transparent hover:text-blue-700"
						onClick={resetFilters}
					>
						Reset All
					</Button>
				</div>
			</div>
		</div>
	);
}