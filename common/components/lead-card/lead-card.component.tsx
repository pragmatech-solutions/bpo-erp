'use client';

import {
	Phone,
	User,
	Wallet,
	Calendar,
	Megaphone,
	DollarSign,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { cn } from '@/lib/utils';

interface LeadCardProps {
	lead: ListedLead;
}

function getStatusPill(status: LeadStatus) {
	if (status === LeadStatus.NON_BILLABLE) return 'bg-[#FFE4E6] text-[#F43F5E]';
	if (status === LeadStatus.PENDING) return 'bg-[#FEF3C7] text-[#F59E0B]';
	if (status === LeadStatus.BILLABLE) return 'bg-[#D1FAE5] text-[#10B981]';

	// Fallback (should not reach here)
	return 'bg-[#FEF3C7] text-[#F59E0B]';
}

function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function LeadCard({ lead }: LeadCardProps) {
	const router = useRouter();
	const userInfo = getCurrentLoggedInUserInformation();
	const isAdmin = userInfo?.currentUser.role === UserRole.ADMIN;
	const isPending = lead.status === LeadStatus.PENDING;
	const canEdit = isAdmin && isPending;

	const handleClick = () => {
		if (canEdit) {
			router.push(`/leads/edit/${lead.id}`);
		}
	};

	return (
		<Card
			onClick={handleClick}
			className={cn(
				'relative rounded-[19px] border-none p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]',
				canEdit && 'cursor-pointer hover:bg-gray-50',
			)}
		>
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-[39px] items-center justify-center rounded-full bg-[#ADADD7] text-[18px] font-bold tracking-wider text-[#424290]">
						{getInitials(lead.customerName)}
					</div>
					<div>
						<div className="text-[14px] text-black lg:text-[16px]">
							Customer Name
						</div>
						<div className="text-[14px] font-semibold text-[#313957] lg:text-[16px]">
							{lead.customerName}
						</div>
					</div>
				</div>

				{lead.status === LeadStatus.BILLABLE ? (
					<span className="inline-flex overflow-hidden rounded-full text-[10px] lg:text-[12px]">
						<span className="bg-[#D1FAE5] px-3 py-1 text-[#10B981]">
							Billable
						</span>
						<span
							className={cn(
								'px-3 py-1 text-white',
								lead.paymentStatus === 'paid' ? 'bg-[#10B981]' : 'bg-[#F43F5E]',
							)}
						>
							{lead.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
						</span>
					</span>
				) : (
					<span
						className={cn(
							'rounded-full px-3 py-1 text-[10px] lg:text-[12px]',
							getStatusPill(lead.status),
						)}
					>
						{lead.status
							.split(' ')
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join('-')}
					</span>
				)}
			</div>

			<div className="grid grid-cols-2 gap-y-4 text-[#313957]">
				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<Phone size={14} className="text-[#26395C]" />
						<span>Number</span>
					</div>
					<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
						{lead.customerNumber}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<Wallet size={14} className="text-[#26395C]" />
						<span>Loan Type</span>
					</div>
					<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
						{lead.loanType}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<User size={14} className="text-[#26395C]" />
						<span>Created By</span>
					</div>
					<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
						{lead.created_by.name}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<Calendar size={14} className="text-[#26395C]" />
						<span>Updated At</span>
					</div>
					<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
						{new Date(lead.updatedAt).toLocaleDateString('en-GB')}
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<Megaphone size={14} className="text-[#26395C]" />
						<span>Campaign</span>
					</div>
					<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
						{lead.campaign}
					</div>
				</div>

				{lead.status === LeadStatus.BILLABLE && (
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
							<DollarSign size={14} className="text-[#26395C]" />
							<span>Payment Status</span>
						</div>
						<div className="pl-6 text-[12px] font-medium lg:text-[14px]">
							{lead.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
						</div>
					</div>
				)}
			</div>

			{lead.status === LeadStatus.NON_BILLABLE && lead.statusReason && (
				<div className="mt-4 -mx-6 bg-[#FFF1F2] px-6 py-2">
					<span className="text-[12px] font-semibold text-[#F43F5E] lg:text-[14px]">
						Reason:{' '}
					</span>
					<span className="text-[12px] italic text-[#3E3E3E] lg:text-[14px]">
						{lead.statusReason}
					</span>
				</div>
			)}
		</Card>
	);
}
