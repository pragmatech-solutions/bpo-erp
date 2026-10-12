'use client';

import type { ReactNode } from 'react';
import {
	BadgeCheck,
	BadgeDollarSign,
	Briefcase,
	Mail,
	MapPin,
	Percent,
	Phone,
	User,
	Wallet,
} from 'lucide-react';
import {
	INSELLERATE_CLIENTS,
	INSELLERATE_EMPLOYMENT_STATUSES,
	INSELLERATE_LOAN_TYPES,
	INSELLERATE_VETERAN_OPTIONS,
} from '@/common/constants/insellerate-lead-options';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';

type Option = { value: string; label: string };

function getLabel(options: readonly Option[], value?: string) {
	if (!value) return undefined;

	return options.find((option) => option.value === value)?.label ?? value;
}

function DetailItem({
	label,
	value,
	icon,
}: {
	label: string;
	value?: string | number;
	icon: ReactNode;
}) {
	const hasValue = value !== undefined && value !== '';

	return (
		<div className="flex min-w-0 flex-col gap-1">
			<div className="flex items-center gap-2 text-[12px] text-black lg:text-[14px]">
				<span className="text-[#26395C]">{icon}</span>
				<span>{label}</span>
			</div>
			<div className="break-words pl-6 text-[12px] font-medium text-[#313957] lg:text-[14px]">
				{hasValue ? String(value) : 'N/A'}
			</div>
		</div>
	);
}

export function InsellerateDetails({ lead }: { lead: ListedLead }) {
	const details = lead.insellerate;
	if (lead.leadType !== 'insellerate' || !details) return null;

	return (
		<div className="mt-5 rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
			<div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#1D4ED8] lg:text-[16px]">
				<BadgeCheck size={16} />
				<span>Insellerate Details</span>
			</div>
			<div className="grid grid-cols-1 gap-4 text-[#313957] sm:grid-cols-2 xl:grid-cols-3">
				<DetailItem
					label="Client"
					value={getLabel(INSELLERATE_CLIENTS, details.clientCampaign)}
					icon={<Briefcase size={14} />}
				/>
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
					label="Mobile"
					value={details.mobile}
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
					label="Zip Code"
					value={details.zip}
					icon={<MapPin size={14} />}
				/>
				<DetailItem
					label="Email"
					value={details.email}
					icon={<Mail size={14} />}
				/>
				<DetailItem
					label="Mortgage Balance"
					value={details.mortgageBalance}
					icon={<BadgeDollarSign size={14} />}
				/>
				<DetailItem
					label="Loan Amount"
					value={details.loanAmount}
					icon={<BadgeDollarSign size={14} />}
				/>
				<DetailItem
					label="Interest Rate"
					value={details.interestRate}
					icon={<Percent size={14} />}
				/>
				<DetailItem
					label="Credit Score"
					value={details.creditScore}
					icon={<BadgeCheck size={14} />}
				/>
				<DetailItem
					label="Veteran"
					value={getLabel(INSELLERATE_VETERAN_OPTIONS, details.veteran)}
					icon={<BadgeCheck size={14} />}
				/>
				<DetailItem
					label="Loan Type"
					value={getLabel(INSELLERATE_LOAN_TYPES, details.loanType)}
					icon={<Wallet size={14} />}
				/>
				<DetailItem
					label="Employment Status"
					value={getLabel(
						INSELLERATE_EMPLOYMENT_STATUSES,
						details.employmentStatus,
					)}
					icon={<Briefcase size={14} />}
				/>
				<DetailItem
					label="Prospect ID"
					value={details.prospectId}
					icon={<BadgeCheck size={14} />}
				/>
			</div>
		</div>
	);
}
