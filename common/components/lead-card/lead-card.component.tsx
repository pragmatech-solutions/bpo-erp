'use client';

import { useState } from 'react';
import {
	BadgeCheck,
	BadgeDollarSign,
	Briefcase,
	Calendar,
	Home,
	Layers,
	Mail,
	MapPin,
	Megaphone,
	Percent,
	Phone,
	Trash2,
	User,
	Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { cn } from '@/lib/utils';
import { softDeleteLeadApi } from './soft-delete-lead.api';

interface LeadCardProps {
	lead: ListedLead;
	onSoftDeleteSuccess?: () => void;
	isSelectable?: boolean;
	isSelected?: boolean;
	onSelectionChange?: (leadId: string, isSelected: boolean) => void;
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat('en-GB').format(new Date(value));
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

function LeadBadges({
	lead,
	canViewPaymentStatus,
}: {
	lead: ListedLead;
	canViewPaymentStatus: boolean;
}) {
	const isCallTransfer = lead.leadType === 'call_transfer';

	return (
		<div className="flex flex-wrap justify-end gap-2">
			{lead.deletedAt ? (
				<span className="rounded-full bg-[#E2E8F0] px-3 py-1 text-[10px] font-medium text-[#475569] lg:text-[12px]">
					Deleted
				</span>
			) : null}

			{isCallTransfer ? (
				<span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[10px] font-medium text-[#2563EB] lg:text-[12px]">
					{getLeadTypeLabel(lead.leadType)}
				</span>
			) : null}

			{lead.status === LeadStatus.BILLABLE ? (
				canViewPaymentStatus ? (
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
					<span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-[10px] text-[#10B981] lg:text-[12px]">
						Billable
					</span>
				)
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
				<DetailItem
					label="City"
					value={details.city}
					icon={<MapPin size={14} />}
				/>
				<DetailItem
					label="State"
					value={details.state}
					icon={<MapPin size={14} />}
				/>
				<DetailItem
					label="ZIP"
					value={details.zip}
					icon={<MapPin size={14} />}
				/>
				<DetailItem
					label="Email"
					value={details.email}
					icon={<Mail size={14} />}
				/>
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

export function LeadCard({
	lead,
	onSoftDeleteSuccess,
	isSelectable = false,
	isSelected = false,
	onSelectionChange,
}: LeadCardProps) {
	const router = useRouter();
	const userInfo = getCurrentLoggedInUserInformation();
	const currentRole = userInfo?.currentUser.role;
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState('');
	const isCallTransfer = lead.leadType === 'call_transfer';
	const canEdit =
		currentRole === UserRole.ADMIN ||
		currentRole === UserRole.QUALITY_ASSURANCE ||
		currentRole === UserRole.LOAN_OFFICER;
	const canSoftDelete = currentRole === UserRole.ADMIN && !lead.deletedAt;
	const canViewPaymentStatus =
		currentRole === UserRole.ADMIN || currentRole === UserRole.TEAM_LEAD;

	const handleClick = () => {
		if (canEdit) {
			router.push(`/leads/edit/${lead.id}`);
		}
	};

	async function handleSoftDelete(event: React.MouseEvent<HTMLButtonElement>) {
		event.stopPropagation();
		if (
			!confirm('Soft delete this lead? Only admins will be able to view it.')
		) {
			return;
		}

		setIsDeleting(true);
		setDeleteError('');
		const response = await softDeleteLeadApi(lead.id);

		if (response.success) {
			onSoftDeleteSuccess?.();
		} else {
			setDeleteError(response.error || 'Failed to soft delete lead');
		}

		setIsDeleting(false);
	}

	return (
		<Card
			onClick={handleClick}
			className={cn(
				'relative rounded-[19px] p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)]',
				lead.deletedAt
					? 'border border-[#CBD5E1] bg-[#F8FAFC] opacity-80'
					: isCallTransfer
						? 'border border-[#BFDBFE] bg-[#F8FBFF]'
						: 'border-none bg-white',
				canEdit && 'cursor-pointer hover:bg-gray-50',
				canEdit && isCallTransfer && !lead.deletedAt && 'hover:bg-[#F1F7FF]',
			)}
		>
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					{isSelectable ? (
						<input
							type="checkbox"
							checked={isSelected}
							onChange={(event) =>
								onSelectionChange?.(lead.id, event.target.checked)
							}
							onClick={(event) => event.stopPropagation()}
							className="size-4 shrink-0 rounded border-[#D4D7E3] accent-[#2563EB]"
							aria-label={`Select ${lead.customerName}`}
						/>
					) : null}
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

				<div className="flex flex-col items-end gap-2">
					<LeadBadges lead={lead} canViewPaymentStatus={canViewPaymentStatus} />
					{canSoftDelete ? (
						<Button
							type="button"
							variant="outline"
							className="h-8 gap-2 rounded-[8px] border-[#FCA5A5] px-3 text-[12px] text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#B91C1C]"
							disabled={isDeleting}
							onClick={handleSoftDelete}
						>
							<Trash2 size={14} />
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					) : null}
				</div>
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
					value={formatDate(lead.updatedAt)}
					icon={<Calendar size={14} />}
				/>
			</div>

			{lead.deletedAt ? (
				<div className="mt-5 rounded-[12px] border border-[#CBD5E1] bg-[#F1F5F9] px-4 py-3 text-[12px] font-medium text-[#475569] lg:text-[14px]">
					Deleted by {lead.deletedBy?.name || 'Unknown'} on{' '}
					{formatDate(lead.deletedAt)}
				</div>
			) : null}

			{deleteError ? (
				<div className="mt-4 text-[12px] font-medium text-red-500 lg:text-[14px]">
					{deleteError}
				</div>
			) : null}

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
