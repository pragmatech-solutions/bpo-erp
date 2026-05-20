'use client';

import { AlertCircle, CheckCircle2, Clock3, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LeadCard } from '@/common/components/lead-card';
import { useOverviewHook } from './overview.hook';

export function Overview() {
	const { data, currentUserName, isLoading, errorMessage } = useOverviewHook();
	if (isLoading)
		return <div className="text-[#313957]">Loading dashboard...</div>;
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
			<h2 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[40px]">
				Recent Leads
			</h2>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{data.recentLeads.map((lead) => (
					<LeadCard key={lead.id} lead={lead} />
				))}
			</div>
		</div>
	);
}
