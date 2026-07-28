'use client';

import {
	Phone,
	User,
	Wallet,
	Calendar,
	Megaphone,
	Briefcase,
	MapPin,
	Mail,
	Home,
	BadgeDollarSign,
	Percent,
	Layers,
	BadgeCheck,
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

type DetailItemProps = {
	label: string;
	value?: string | number | null;
	icon: React.ReactNode;
};

function getStatusPill(status: LeadStatus) {
	if (status === LeadStatus.NON_BILLABLE) return 'bg-[#FFE4E6] text-[#F43F5E]';
	if (status === LeadStatus.PENDING) return 'bg-[#FEF3C7] text-[#F59E0B]';
	if (status === LeadStatus.BILLABLE) return 'bg-[#D1FAE5] text-[#10B981]';

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

function getTitleCase(value: string) {
	return value
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join('-');
}

function getLeadTypeLabel(leadType?: ListedLead['leadType']) {
	return leadType === 'call_transfer' ? 'Call Transfer' : 'Standard';
}

function formatOptionalValue(value?: string | number | null) {
	if (value === undefined || value === null || value === '') return 'N/A';
	return String(value);
}

function DetailItem({ label, value, icon }: DetailItemProps) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
				<span className="text-[#26395C]">{icon}</span>
				<span>{label}</span>
			</div>
			<div className="break-words pl-6 text-[12px] font-medium text-[#313957] lg:text-[14px]">
				{formatOptionalValue(value)}
			</div>
		</div>
	);
}

function LeadBadges({ lead }: { lead: ListedLead }) {
	const isCallTransfer = lead.leadType === 'call_transfer';

	return (
		<div className="flex flex-wrap justify-end gap-2">
			{isCallTransfer ? (
				<span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[10px] font-medium text-[#2563EB] lg:text-[12px]">
					{getLeadTypeLabel(lead.leadType)}
				</span>
			) : null}

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
					{getTitleCase(lead.status)}
				</span>
			)}
		</div>
	);
}

function CallTransferDetails({ lead }: { lead: ListedLead }) {
	const details = lead.callTransfer;
	if (lead.leadType !== 'call_transfer' || !details) return null;

	return (
		<div className="mt-5 rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
			<div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#1D4ED8] lg:text-[16px]">
				<BadgeCheck size={16} />
				<span>Call Transfer Details</span>
			</div>
			<div className="grid grid-cols-1 gap-4 text-[#313957] sm:grid-cols-2 xl:grid-cols-3">
				<DetailItem
					label="First Name"
					value={details.firstName}
					icon={<User size={14} />}
				/>
				<DetailItem
					label="Last Name"
					value={details.lastName}
					icon={<User size={14} />}
				/>
				<DetailItem
					label="Origin Phone"
					value={details.originPhone}
					icon={<Phone size={14} />}
				/>
				<DetailItem
					label="Address"
					value={details.address}
					icon={<MapPin size={14} />}
				/>
				<DetailItem label="City" value={details.city} icon={<MapPin size={14} />} />
				<DetailItem label="State" value={details.state} icon={<MapPin size={14} />} />
				<DetailItem label="ZIP" value={details.zip} icon={<MapPin size={14} />} />
				<DetailItem label="Email" value={details.email} icon={<Mail size={14} />} />
				<DetailItem
					label="Home Value"
					value={details.homeValue}
					icon={<Home size={14} />}
				/>
				<DetailItem
					label="Loan Balance"
					value={details.mortgageBalance}
					icon={<BadgeDollarSign size={14} />}
				/>
				<DetailItem
					label="Mortgage Rate Type"
					value={details.mortgageRateType}
					icon={<Percent size={14} />}
				/>
				<DetailItem
					label="Property Type"
					value={details.propertyType}
					icon={<Home size={14} />}
				/>
				<DetailItem
					label="Multiple Properties"
					value={details.multipleProperties}
					icon={<Layers size={14} />}
				/>
				<DetailItem
					label="Mortgage Rate"
					value={details.mortgageRate}
					icon={<Percent size={14} />}
				/>
				<DetailItem
					label="Cash Out Amount"
					value={details.cashOutAmount}
					icon={<BadgeDollarSign size={14} />}
				/>
				<DetailItem
					label="Call Transfer Loan Type"
					value={details.loanType}
					icon={<Wallet size={14} />}
				/>
				<DetailItem
					label="Loan Purpose"
					value={details.loanPurpose}
					icon={<Wallet size={14} />}
				/>
				<DetailItem
					label="Credit"
					value={details.credit}
					icon={<BadgeCheck size={14} />}
				/>
			</div>
		</div>
	);
}

export function LeadCard({ lead }: LeadCardProps) {
	const router = useRouter();
	const userInfo = getCurrentLoggedInUserInformation();
	const currentRole = userInfo?.currentUser.role;
	const isPending = lead.status === LeadStatus.PENDING;
	const isCallTransfer = lead.leadType === 'call_transfer';
	const canEdit =
		(currentRole === UserRole.ADMIN && isPending) ||
		currentRole === UserRole.QUALITY_ASSURANCE ||
		currentRole === UserRole.LOAN_OFFICER;

	const handleClick = () => {
		if (canEdit) {
			router.push(`/leads/edit/${lead.id}`);
		}
	};

	return (
		<Card
			onClick={handleClick}
			className={cn(
				'relative rounded-[19px] p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]',
				isCallTransfer
					? 'border border-[#BFDBFE] bg-[#F8FBFF]'
					: 'border-none bg-white',
				canEdit && 'cursor-pointer hover:bg-gray-50',
				canEdit && isCallTransfer && 'hover:bg-[#F1F7FF]',
			)}
		>
			<div className="mb-4 flex items-start justify-between gap-4">
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

				<LeadBadges lead={lead} />
			</div>

			<div className="grid grid-cols-1 gap-y-4 text-[#313957] sm:grid-cols-2">
				<DetailItem
					label="Number"
					value={lead.customerNumber}
					icon={<Phone size={14} />}
				/>

				<DetailItem
					label="Created By"
					value={lead.created_by.name}
					icon={<User size={14} />}
				/>

				<DetailItem
					label="Loan Type"
					value={lead.loanType}
					icon={<Wallet size={14} />}
				/>

				<DetailItem
					label="Campaign"
					value={lead.campaign}
					icon={<Megaphone size={14} />}
				/>

				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
						<Briefcase size={14} className="text-[#26395C]" />
						<span>Loan Officer</span>
					</div>
					<div className="break-words pl-6 text-[12px] font-medium text-[#313957] lg:text-[14px]">
						{lead.loanOfficerName || 'N/A'}
						{lead.loanOfficerPhoneNumber && (
							<span className="block text-[#6B7A99]">
								{lead.loanOfficerPhoneNumber}
							</span>
						)}
					</div>
				</div>

				<DetailItem
					label="Username"
					value={lead.username}
					icon={<User size={14} />}
				/>

				<DetailItem
					label="Updated At"
					value={new Date(lead.updatedAt).toLocaleDateString('en-GB')}
					icon={<Calendar size={14} />}
				/>
			</div>

			<CallTransferDetails lead={lead} />

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