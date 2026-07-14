'use client';

import { AlertCircle, CheckCircle2, Clock3, Filter, Search, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LeadCard } from '@/common/components/lead-card';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import {
	useTeamDashboardHook,
	type TeamLeadPaymentStatusFilter,
	type TeamLeadStatusFilter,
} from './team-dashboard.hook';

const STATUSES: TeamLeadStatusFilter[] = [
	'All Status',
	LeadStatus.BILLABLE,
	LeadStatus.NON_BILLABLE,
	LeadStatus.PENDING,
];

const PAYMENT_STATUSES: TeamLeadPaymentStatusFilter[] = [
	'All Payment Status',
	'paid',
	'unpaid',
];

function formatStatus(status: string) {
	return status
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function TeamDashboard() {
	const { data, agents, isLoading, errorMessage, filters, resetFilters } =
		useTeamDashboardHook();

	if (isLoading) {
		return <div className="text-[#313957]">Loading team dashboard...</div>;
	}

	if (errorMessage) {
		return <div className="text-red-500">{errorMessage}</div>;
	}

	if (!data) {
		return <div className="text-[#313957]">No team data available.</div>;
	}

	const statCards = [
		{
			label: 'Total Leads',
			value: data.analytics.total,
			color: 'bg-[#EBF5FF]',
			icon: <Users className="text-[#6A90CC]" />,
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
			<div>
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[40px]">
					Team Dashboard
				</h1>
				<p className="mt-1 text-[14px] font-medium text-[#313957] lg:text-[18px]">
					{data.team.name}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{statCards.map((card) => (
					<Card
						key={card.label}
						className={`rounded-[19px] border-none p-5 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] ${card.color}`}
					>
						<div className="flex items-center gap-3">
							<div className="flex size-[48px] items-center justify-center rounded-full bg-white/40">
								{card.icon}
							</div>
							<div>
								<div className="text-[30px] font-semibold leading-none text-[#313957]">
									{String(card.value).padStart(2, '0')}
								</div>
								<div className="text-[13px] font-semibold text-[#313957] lg:text-[15px]">
									{card.label}
								</div>
							</div>
						</div>
					</Card>
				))}
			</div>

			<div className="flex flex-col gap-4 rounded-[19px] bg-white p-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
					<div className="flex items-center gap-2 text-[#313957]">
						<Filter size={20} />
						<span className="text-[16px]">Filter</span>
					</div>
					<div className="relative w-full lg:w-[260px]">
						<Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#313957]" />
						<Input
							placeholder="Search leads"
							className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white pl-11"
							value={filters.search}
							onChange={(event) => filters.setSearch(event.target.value)}
						/>
					</div>

					<Select value={filters.agentId} onValueChange={filters.setAgentId}>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white lg:w-[214px]">
							<SelectValue placeholder="All Agents" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							<SelectItem value="All Agents">All Agents</SelectItem>
							{agents.map((agent) => (
								<SelectItem key={agent.id} value={agent.id}>
									{agent.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={filters.status}
						onValueChange={(value) =>
							filters.setStatus(value as TeamLeadStatusFilter)
						}
					>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white lg:w-[214px]">
							<SelectValue placeholder="All Status" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							{STATUSES.map((status) => (
								<SelectItem key={status} value={status}>
									{status === 'All Status' ? status : formatStatus(status)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{filters.status === LeadStatus.BILLABLE && (
						<Select
							value={filters.paymentStatus}
							onValueChange={(value) =>
								filters.setPaymentStatus(value as TeamLeadPaymentStatusFilter)
							}
						>
							<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white lg:w-[214px]">
								<SelectValue placeholder="All Payment Status" />
							</SelectTrigger>
							<SelectContent className="rounded-[19px] border-none shadow-xl">
								{PAYMENT_STATUSES.map((status) => (
									<SelectItem key={status} value={status}>
										{status === 'All Payment Status'
											? status
											: formatStatus(status)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					<Select value={filters.campaign} onValueChange={filters.setCampaign}>
						<SelectTrigger className="h-[48px] w-full rounded-[12px] border-[#D4D7E3] bg-white lg:w-[214px]">
							<SelectValue placeholder="All Campaigns" />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							<SelectItem value="All Campaigns">All Campaigns</SelectItem>
							{data.campaigns.map((campaign) => (
								<SelectItem key={campaign} value={campaign}>
									{campaign}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Button
					variant="ghost"
					className="h-auto p-0 text-[14px] text-[#4547D3] hover:bg-transparent hover:text-blue-700"
					onClick={resetFilters}
				>
					Reset All
				</Button>
			</div>

			<section className="flex flex-col gap-4">
				<h2 className="font-[var(--font-poppins)] text-[22px] font-semibold text-[#0C1421] lg:text-[30px]">
					Team Members
				</h2>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{data.members.map((member) => (
						<Card
							key={member.id}
							className="rounded-[19px] border-none p-5 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]"
						>
							<div className="mb-4 flex items-center gap-3">
								<div className="flex size-[42px] items-center justify-center rounded-full bg-[#ADADD7] text-[16px] font-bold text-[#424290]">
									<User size={22} />
								</div>
								<div>
									<p className="text-[16px] font-semibold text-[#313957]">
										{member.name}
									</p>
									<p className="text-[13px] text-[#8897AD]">{member.email}</p>
								</div>
							</div>
							<div className="grid grid-cols-4 gap-2 text-center text-[#313957]">
								<div><p className="text-[20px] font-semibold">{member.analytics.total}</p><p className="text-[11px]">Total</p></div>
								<div><p className="text-[20px] font-semibold">{member.analytics.pending}</p><p className="text-[11px]">Pending</p></div>
								<div><p className="text-[20px] font-semibold">{member.analytics.billable}</p><p className="text-[11px]">Billable</p></div>
								<div><p className="text-[20px] font-semibold">{member.analytics.nonBillable}</p><p className="text-[11px]">Non-Billable</p></div>
							</div>
						</Card>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-4 pb-10">
				<h2 className="font-[var(--font-poppins)] text-[22px] font-semibold text-[#0C1421] lg:text-[30px]">
					Team Lead List
				</h2>
				{data.leads.length === 0 ? (
					<div className="flex h-40 items-center justify-center text-[#313957]">
						No leads found.
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{data.leads.map((lead) => (
							<LeadCard key={lead.id} lead={lead} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}

