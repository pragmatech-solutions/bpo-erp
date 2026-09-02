'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronDown,
	Clock3,
	Filter,
	Search,
	User,
	Users,
} from 'lucide-react';
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
import { Pagination } from '@/common/components/pagination';
import { PAGE_SIZE_OPTIONS } from '@/common/constants/pagination';
import { getUserRoleLabel } from '@/common/constants/user-role-label';
import type {
	TeamMemberPerformance,
	TeamOverviewItem,
} from '@/teams/backend/manage-teams/manage-teams.type';
import { getTeamPerformanceApi } from './team-overview.api';
import {
	useTeamOverviewHook,
	type TeamDurationPreset,
	type TeamStatusFilter,
} from './team-overview.hook';

const DURATIONS: TeamDurationPreset[] = [
	'Today',
	'Yesterday',
	'Last 7 Days',
	'Last 30 Days',
	'This Month',
	'Last Month',
	'All',
];

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-US').format(new Date(value));
}

function initials(name: string) {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function teamLeadNames(team: TeamOverviewItem) {
	if (team.teamLeads.length === 0) return 'Unassigned';
	return team.teamLeads.map((teamLead) => teamLead.name).join(', ');
}

function memberBreakdown(team: TeamOverviewItem) {
	return `${team.agentCount} agents · ${team.loanOfficerCount} loan officers`;
}

function formatAccountStatus(status: string) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function getAccountStatusDotClass(status: string) {
	if (status === 'blocked') return 'bg-[#F43F5E]';
	if (status === 'inactive') return 'bg-[#F59E0B]';
	return 'bg-[#10B981]';
}

function StatCards({
	stats,
}: {
	stats: {
		total: number;
		pending: number;
		billable: number;
		nonBillable: number;
	};
}) {
	const cards = [
		{
			label: 'Total',
			desktopLabel: 'Total Leads',
			value: stats.total,
			className: 'bg-[#EBF5FF]',
			icon: <User className="size-7 text-[#6A90CC] lg:size-8" />,
		},
		{
			label: 'Pending',
			desktopLabel: 'Pending',
			value: stats.pending,
			className: 'bg-[#FFF7EC]',
			icon: <Clock3 className="size-7 text-[#F59E0B] lg:size-8" />,
		},
		{
			label: 'Billable',
			desktopLabel: 'Billable',
			value: stats.billable,
			className: 'bg-[#E8FFF9]',
			icon: <CheckCircle2 className="size-7 text-[#10B981] lg:size-8" />,
		},
		{
			label: 'Non-Billable',
			desktopLabel: 'Non-Billable',
			value: stats.nonBillable,
			className: 'bg-[#FFEDF0]',
			icon: <AlertCircle className="size-7 text-[#F43F5E] lg:size-8" />,
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 lg:rounded-[20px] lg:bg-[#F7FBFF] lg:p-8">
			{cards.map((card) => (
				<Card
					key={card.label}
					className={`rounded-[10px] border-none p-4 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:rounded-[20px] lg:p-5 ${card.className}`}
				>
					<div className="flex items-center gap-3 lg:gap-4">
						<div className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-white/40 lg:size-[64px]">
							{card.icon}
						</div>
						<div className="min-w-0">
							<div className="text-[30px] font-semibold leading-none text-[#313957] lg:text-[34px]">
								{String(card.value).padStart(2, '0')}
							</div>
							<div className="text-[14px] font-semibold leading-tight text-[#313957] lg:text-[16px]">
								<span className="lg:hidden">{card.label}</span>
								<span className="hidden lg:inline">{card.desktopLabel}</span>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

export function TeamOverview({
	canCreateTeams = false,
}: {
	canCreateTeams?: boolean;
}) {
	const teams = useTeamOverviewHook();
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
	const [memberCache, setMemberCache] = useState<
		Record<string, TeamMemberPerformance[]>
	>({});
	const [loadingMembersId, setLoadingMembersId] = useState<string | null>(null);

	const toggleExpanded = async (team: TeamOverviewItem) => {
		if (expandedTeamId === team.id) {
			setExpandedTeamId(null);
			return;
		}

		setExpandedTeamId(team.id);

		try {
			setLoadingMembersId(team.id);
			const data = await getTeamPerformanceApi(team.id);
			setMemberCache((current) => ({ ...current, [team.id]: data.members }));
		} finally {
			setLoadingMembersId(null);
		}
	};

	return (
		<div className="flex flex-col gap-4 lg:gap-6">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#313957] lg:text-[40px] lg:text-[#0C1421]">
				<span className="lg:hidden">Team Management</span>
				<span className="hidden lg:inline">Team Overview</span>
			</h1>

			<StatCards stats={teams.stats} />

			<div className="flex gap-2 lg:hidden">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
					<Input
						value={teams.search}
						onChange={(event) => teams.setSearch(event.target.value)}
						placeholder="Search"
						className="h-[48px] rounded-[10px] border-[#D4D7E3] bg-white pl-12 text-[14px] focus-visible:ring-blue-500"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={() => setShowMobileFilters((current) => !current)}
					className="size-[48px] shrink-0 rounded-[10px] border-[#D4D7E3] bg-white text-[#26395C]"
					aria-label="Toggle team filters"
				>
					<Filter className="size-5" />
				</Button>
			</div>

			<div
				className={`${
					showMobileFilters ? 'block' : 'hidden'
				} rounded-[14px] bg-white p-4 lg:hidden`}
			>
				<div className="mb-3 flex justify-end">
					<Button
						variant="ghost"
						className="h-auto p-0 text-[12px] text-[#4547D3] hover:bg-transparent"
						onClick={teams.resetFilters}
					>
						Reset All
					</Button>
				</div>
				<div className="grid gap-3">
					<Select
						value={teams.duration}
						onValueChange={(value) =>
							teams.setDuration(value as TeamDurationPreset)
						}
					>
						<SelectTrigger className="h-[48px] rounded-[10px] border-[#D4D7E3]">
							<SelectValue placeholder="Select Duration" />
						</SelectTrigger>
						<SelectContent>
							{DURATIONS.map((duration) => (
								<SelectItem key={duration} value={duration}>
									{duration === 'All' ? 'Select Duration' : duration}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={teams.status}
						onValueChange={(value) =>
							teams.setStatus(value as TeamStatusFilter)
						}
					>
						<SelectTrigger className="h-[48px] rounded-[10px] border-[#D4D7E3]">
							<SelectValue placeholder="All Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>
					<Select value={teams.teamLeadId} onValueChange={teams.setTeamLeadId}>
						<SelectTrigger className="h-[48px] rounded-[10px] border-[#D4D7E3]">
							<SelectValue placeholder="Team Lead" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Team Lead</SelectItem>
							{teams.teamLeads.map((teamLead) => (
								<SelectItem key={teamLead.id} value={teamLead.id}>
									{teamLead.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="hidden flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between">
				<h2 className="text-[28px] font-semibold text-[#0C1421]">All Teams</h2>
				<div className="flex flex-col gap-3 lg:flex-row">
					<div className="relative w-full lg:w-[344px]">
						<Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8897AD]" />
						<Input
							value={teams.search}
							onChange={(event) => teams.setSearch(event.target.value)}
							placeholder="Search team..."
							className="h-[48px] rounded-[12px] border-[#D4D7E3] bg-white pl-12"
						/>
					</div>
					{canCreateTeams && (
						<Button
							asChild
							className="h-[48px] rounded-[12px] bg-[#2F61E8] px-8 text-[16px]"
						>
							<Link href="/teams/create">+ Create Team</Link>
						</Button>
					)}
				</div>
			</div>

			{teams.errorMessage && (
				<div className="rounded-[12px] bg-red-50 p-4 text-red-600">
					{teams.errorMessage}
				</div>
			)}

			<div className="flex flex-col gap-3 lg:hidden">
				{teams.isLoading ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						Loading teams...
					</div>
				) : teams.teams.length === 0 ? (
					<div className="rounded-[12px] bg-white p-5 text-center text-[#313957]">
						No teams found.
					</div>
				) : (
					teams.teams.map((team) => (
						<TeamMobileCard
							key={team.id}
							team={team}
							isExpanded={expandedTeamId === team.id}
							members={memberCache[team.id] || []}
							isLoadingMembers={loadingMembersId === team.id}
							onToggle={() => toggleExpanded(team)}
						/>
					))
				)}
			</div>

			<div className="hidden overflow-hidden rounded-[20px] bg-white shadow-sm lg:block">
				{teams.isLoading ? (
					<div className="px-6 py-10 text-center text-[#313957]">
						Loading teams...
					</div>
				) : teams.teams.length === 0 ? (
					<div className="px-6 py-10 text-center text-[#313957]">
						No teams found.
					</div>
				) : (
					teams.teams.map((team) => (
						<DesktopTeamSection
							key={team.id}
							team={team}
							isExpanded={expandedTeamId === team.id}
							members={memberCache[team.id] || []}
							isLoadingMembers={loadingMembersId === team.id}
							onToggle={() => toggleExpanded(team)}
						/>
					))
				)}
				<Pagination
					page={teams.page}
					totalPages={teams.totalPages}
					total={teams.total}
					limit={teams.limit}
					itemLabel="teams"
					onPageChange={teams.setPage}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
					onPageSizeChange={teams.setLimit}
				/>
			</div>

			<div className="lg:hidden">
				<Pagination
					page={teams.page}
					totalPages={teams.totalPages}
					total={teams.total}
					limit={teams.limit}
					itemLabel="teams"
					onPageChange={teams.setPage}
					pageSizeOptions={PAGE_SIZE_OPTIONS}
					onPageSizeChange={teams.setLimit}
				/>
			</div>

			{canCreateTeams && (
				<Button
					asChild
					className="fixed bottom-6 right-6 z-30 h-[48px] rounded-[8px] bg-[#2F61E8] px-5 text-[14px] shadow-lg lg:hidden"
				>
					<Link href="/teams/create">+ Create Team</Link>
				</Button>
			)}
		</div>
	);
}

function DesktopTeamSection({
	team,
	isExpanded,
	members,
	isLoadingMembers,
	onToggle,
}: {
	team: TeamOverviewItem;
	isExpanded: boolean;
	members: TeamMemberPerformance[];
	isLoadingMembers: boolean;
	onToggle: () => void;
}) {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onToggle();
		}
	};

	return (
		<div className="border-b border-[#D4D7E3] last:border-b-0">
			<div
				role="button"
				tabIndex={0}
				onClick={onToggle}
				onKeyDown={handleKeyDown}
				className="grid cursor-pointer grid-cols-[1.4fr_1.1fr_0.8fr_0.9fr_0.8fr_0.8fr_0.9fr_1fr_32px] items-center gap-3 px-6 py-4 text-[#0C1421] transition-colors hover:bg-[#F7FBFF]"
			>
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E5F0FF]">
						<Users className="size-5 text-[#26395C]" />
					</span>
					<div className="min-w-0">
						<div className="truncate text-[14px] font-semibold">
							{team.name}
						</div>
					</div>
				</div>
				<div className="min-w-0">
					<div
						className="truncate text-[13px] font-medium"
						title={teamLeadNames(team)}
					>
						{teamLeadNames(team)}
					</div>
					<div className="text-[11px] text-black">
						{team.teamLeads.length > 1 ? 'Team Leads' : 'Team Lead'}
					</div>
				</div>
				<DesktopSummaryStat
					value={team.memberCount}
					label={memberBreakdown(team)}
				/>
				<DesktopSummaryStat value={team.stats.total} label="Total Leads" />
				<DesktopSummaryStat
					value={String(team.stats.pending).padStart(2, '0')}
					label="Pending"
					className="text-[#F59E0B]"
				/>
				<DesktopSummaryStat
					value={String(team.stats.billable).padStart(2, '0')}
					label="Billable"
					className="text-[#10B981]"
				/>
				<DesktopSummaryStat
					value={String(team.stats.nonBillable).padStart(2, '0')}
					label="Non-Billable"
					className="text-[#F43F5E]"
				/>
				<DesktopSummaryStat
					value={formatDate(team.createdAt)}
					label="Created On"
				/>
				{isExpanded ? (
					<ChevronDown className="size-5 text-black" />
				) : (
					<ChevronLeft className="size-5 text-black" />
				)}
			</div>

			{isExpanded && (
				<div className="border-t border-[#D4D7E3]">
					<div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] bg-[#F1F5FB] px-6 py-4 text-[13px] font-semibold text-black">
						<span>Members</span>
						<span>Total Leads</span>
						<span>Pending</span>
						<span>Billable</span>
						<span>Non-Billable</span>
						<span>Status</span>
					</div>
					{isLoadingMembers ? (
						<div className="px-6 py-8 text-center text-[#313957]">
							Loading members...
						</div>
					) : members.length === 0 ? (
						<div className="px-6 py-8 text-center text-[#313957]">
							No members found.
						</div>
					) : (
						members.map((member) => (
							<div
								key={member.id}
								className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] border-t border-[#D4D7E3] px-6 py-4 text-[13px] text-black"
							>
								<span className="flex min-w-0 items-center gap-2">
									<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#C5BFF0] text-[10px]">
										{initials(member.name)}
									</span>
									<span className="min-w-0">
										<span className="block truncate">{member.name}</span>
										<span className="block truncate text-[11px] text-[#8897AD]">
											{getUserRoleLabel(member.role)}
										</span>
									</span>
								</span>
								<span>{member.stats.total}</span>
								<span className="text-[#F59E0B]">
									{String(member.stats.pending).padStart(2, '0')}
								</span>
								<span className="text-[#10B981]">
									{String(member.stats.billable).padStart(2, '0')}
								</span>
								<span className="text-[#F43F5E]">
									{String(member.stats.nonBillable).padStart(2, '0')}
								</span>
								<span className="flex items-center gap-2">
									<span className={getAccountStatusDotClass(member.status) + ' size-2 rounded-full'} />
									{formatAccountStatus(member.status)}
								</span>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}

function DesktopSummaryStat({
	value,
	label,
	className = '',
}: {
	value: number | string;
	label: string;
	className?: string;
}) {
	return (
		<div className="text-center">
			<div className={`text-[13px] font-semibold ${className}`}>{value}</div>
			<div className="text-[11px] leading-tight text-black">{label}</div>
		</div>
	);
}
function TeamStat({
	value,
	label,
	className = '',
}: {
	value: number | string;
	label: string;
	className?: string;
}) {
	return (
		<div className="text-center">
			<div className={`text-[11px] font-medium ${className}`}>{value}</div>
			<div className="text-[9px] font-medium leading-tight text-black">
				{label}
			</div>
		</div>
	);
}

function TeamMobileCard({
	team,
	isExpanded,
	members,
	isLoadingMembers,
	onToggle,
}: {
	team: TeamOverviewItem;
	isExpanded: boolean;
	members: TeamMemberPerformance[];
	isLoadingMembers: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="overflow-hidden rounded-[14px] bg-white shadow-sm">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
			>
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E5F0FF]">
						<Users className="size-5 text-[#26395C]" />
					</span>
					<div className="min-w-0">
						<h2 className="truncate text-[14px] font-semibold text-black">
							{team.name}
						</h2>
						<p className="truncate text-[12px] font-medium text-black">
							{team.teamLeads.length > 1 ? 'Team Leads' : 'Team Lead'}:{' '}
							{teamLeadNames(team)}
						</p>
					</div>
				</div>
				{isExpanded ? (
					<ChevronDown className="size-5 shrink-0 text-black" />
				) : (
					<ChevronLeft className="size-5 shrink-0 text-black" />
				)}
			</button>

			<div className="border-t border-[#D4D7E3] px-3 py-3">
				<div className="grid grid-cols-6 items-start gap-1">
					<TeamStat value={team.memberCount} label={memberBreakdown(team)} />
					<TeamStat value={team.stats.total} label="Total Leads" />
					<TeamStat
						value={String(team.stats.pending).padStart(2, '0')}
						label="Pending"
						className="text-[#F59E0B]"
					/>
					<TeamStat
						value={String(team.stats.billable).padStart(2, '0')}
						label="Billable"
						className="text-[#10B981]"
					/>
					<TeamStat
						value={String(team.stats.nonBillable).padStart(2, '0')}
						label="Non-Billable"
						className="text-[#F43F5E]"
					/>
					<TeamStat value={formatDate(team.createdAt)} label="Created On" />
				</div>
			</div>

			{isExpanded && (
				<div className="px-3 pb-3">
					<div className="overflow-hidden rounded-[8px] border border-[#D4D7E3]">
						<div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr] bg-[#F7FBFF] px-2 py-2 text-[9px] font-semibold text-black">
							<span>Members</span>
							<span>Total Leads</span>
							<span>Pending</span>
							<span>Billable</span>
							<span>Non-Billable</span>
							<span>Status</span>
						</div>
						{isLoadingMembers ? (
							<div className="px-2 py-4 text-center text-[11px] text-[#313957]">
								Loading members...
							</div>
						) : members.length === 0 ? (
							<div className="px-2 py-4 text-center text-[11px] text-[#313957]">
								No members found.
							</div>
						) : (
							members.map((member) => (
								<div
									key={member.id}
									className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr] border-t border-[#D4D7E3] px-2 py-2 text-[9px] text-black"
								>
									<span className="min-w-0">
										<span className="block truncate">{member.name}</span>
										<span className="block truncate text-[8px] text-[#8897AD]">
											{getUserRoleLabel(member.role)}
										</span>
									</span>
									<span>{member.stats.total}</span>
									<span className="text-[#F59E0B]">
										{String(member.stats.pending).padStart(2, '0')}
									</span>
									<span className="text-[#10B981]">
										{String(member.stats.billable).padStart(2, '0')}
									</span>
									<span className="text-[#F43F5E]">
										{String(member.stats.nonBillable).padStart(2, '0')}
									</span>
									<span className="flex items-center gap-1">
										<span className={getAccountStatusDotClass(member.status) + ' size-1.5 rounded-full'} />
										{formatAccountStatus(member.status)}
									</span>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export { StatCards };
