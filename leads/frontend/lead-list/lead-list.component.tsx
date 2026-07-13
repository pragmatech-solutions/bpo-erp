'use client';

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
import { DatePickerWithRange } from './components/date-range-picker.component';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import {
	useLeadListHook,
	type DurationPreset,
	type LeadStatusFilter,
	type PaymentStatusFilter,
} from './lead-list.hook';

const DURATIONS: DurationPreset[] = [
	'Today',
	'Yesterday',
	'Last 7 Days',
	'Last 30 Days',
	'This Month',
	'Last Month',
	'All',
	'Custom Range',
];

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

export function LeadList() {
	const {
		leads,
		isLoading,
		errorMessage,
		filters,
		resetFilters,
		canFilterAgents,
		agents,
	} = useLeadListHook();

	return (
		<div className="flex flex-col gap-6">
			{/* Header & Search */}
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
						onChange={(e) => filters.setSearch(e.target.value)}
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
						<Select
							value={filters.duration}
							onValueChange={(val) =>
								filters.setDuration(val as DurationPreset)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[307px]">
								<SelectValue placeholder="Select Duration" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{DURATIONS.map((d) => (
									<SelectItem key={d} value={d}>
										{d}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{filters.duration === 'Custom Range' && (
							<DatePickerWithRange
								date={
									filters.customDateRange
										? {
												from: filters.customDateRange.start,
												to: filters.customDateRange.end,
											}
										: undefined
								}
								onDateChange={(range) => {
									if (range?.from) {
										filters.setCustomDateRange({
											start: range.from,
											end: range.to || range.from,
										});
									} else {
										filters.setCustomDateRange(null);
									}
								}}
							/>
						)}

						<Select
							value={filters.status}
							onValueChange={(val) => filters.setStatus(val as LeadStatus)}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
								<SelectValue placeholder="All Status" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{s === 'All Status'
											? s
											: s
													.split(' ')
													.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
													.join(' ')}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{filters.status === LeadStatus.BILLABLE && (
							<Select
								value={filters.paymentStatus}
								onValueChange={(val) =>
									filters.setPaymentStatus(val as PaymentStatusFilter)
								}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
									<SelectValue placeholder="All Payment Status" />
								</SelectTrigger>
								<SelectContent className="rounded-[19px] border-none shadow-xl">
									{PAYMENT_STATUSES.map((s) => (
										<SelectItem key={s} value={s}>
											{s === 'All Payment Status'
												? s
												: s.charAt(0).toUpperCase() + s.slice(1)}
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
								{CAMPAIGNS.map((c) => (
									<SelectItem key={c} value={c}>
										{c}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{canFilterAgents && (
							<Select
								value={filters.agentId}
								onValueChange={filters.setAgentId}
							>
								<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white px-4 lg:w-[214px]">
									<SelectValue placeholder="All Agents" />
								</SelectTrigger>
								<SelectContent className="rounded-[19px] border-none shadow-xl">
									<SelectItem value="All Agents">All Agents</SelectItem>
									{agents.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.name}
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

			{/* Leads Grid */}
			<div className="flex-1">
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
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pb-10">
						{leads.map((lead) => (
							<LeadCard key={lead.id} lead={lead} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}


