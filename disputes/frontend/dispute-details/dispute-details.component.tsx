'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
	ArrowLeft,
	Briefcase,
	Calendar,
	ExternalLink,
	Megaphone,
	Phone,
	User,
	Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { cn } from '@/lib/utils';
import type { ListedDispute } from '@/disputes/backend/list-disputes/list-disputes.type';
import { getDisputeApi, resolveDisputeApi } from './dispute-details.api';

type DetailItemProps = {
	label: string;
	value?: string;
	icon: React.ReactNode;
};

type FinalDecision = LeadStatus.BILLABLE | LeadStatus.NON_BILLABLE;

const DECISION_OPTIONS: Array<{
	value: FinalDecision;
	title: string;
	subtitle: string;
}> = [
	{
		value: LeadStatus.BILLABLE,
		title: 'Mark as Billable',
		subtitle: 'Final decision favors billing the lead',
	},
	{
		value: LeadStatus.NON_BILLABLE,
		title: 'Mark as Non-Billable',
		subtitle: 'Final decision rejects billing the lead',
	},
];

function formatDate(value?: string) {
	return value ? new Intl.DateTimeFormat('en-US').format(new Date(value)) : 'N/A';
}

function getInitials(name?: string) {
	return (name || 'NA')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

function statusLabel(status: DisputeStatus) {
	return status === DisputeStatus.RESOLVED ? 'Resolved' : 'Unresolved';
}

function statusClass(status: DisputeStatus) {
	if (status === DisputeStatus.RESOLVED) return 'bg-[#D1FAE5] text-[#10B981]';
	return 'bg-[#FEF3C7] text-[#F59E0B]';
}

function leadStatusLabel(status?: LeadStatus) {
	if (status === LeadStatus.BILLABLE) return 'Billable';
	if (status === LeadStatus.NON_BILLABLE) return 'Non-Billable';
	return 'Pending';
}

function DetailItem({ label, value, icon }: DetailItemProps) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<div className="flex items-center gap-2 text-[12px] text-black">
				<span className="text-[#26395C]">{icon}</span>
				<span>{label}</span>
			</div>
			<div className="break-words pl-6 text-[12px] font-medium text-[#313957]">
				{value || 'N/A'}
			</div>
		</div>
	);
}

export function DisputeDetails({ id }: { id: string }) {
	const [dispute, setDispute] = useState<ListedDispute | null>(null);
	const [decision, setDecision] = useState<FinalDecision | ''>('');
	const [decisionNotes, setDecisionNotes] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const currentRole = getCurrentLoggedInUserInformation()?.currentUser.role as
		| UserRole
		| undefined;
	const canResolve = currentRole === UserRole.ADMIN || currentRole === UserRole.MANAGER;

	const loadDispute = useCallback(async () => {
		const response = await getDisputeApi(id);

		if (response.success && response.data) {
			setDispute(response.data);
			setDecision(
				response.data.lead.status === LeadStatus.BILLABLE ||
					response.data.lead.status === LeadStatus.NON_BILLABLE
					? response.data.lead.status
					: '',
			);
			setDecisionNotes(response.data.decisionNotes || '');
			setError('');
		} else {
			setError(response.error || 'Failed to fetch dispute');
		}

		setIsLoading(false);
	}, [id]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void loadDispute();
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, [loadDispute]);

	async function submitDecision() {
		if (!decision) {
			setError('Select a final decision before submitting');
			return;
		}

		setIsSubmitting(true);
		setError('');
		setMessage('');

		const response = await resolveDisputeApi(id, { decision, decisionNotes });
		if (response.success) {
			setMessage(response.message || 'Dispute resolved successfully');
			await loadDispute();
		} else {
			setError(response.error || 'Failed to resolve dispute');
		}

		setIsSubmitting(false);
	}

	if (isLoading) {
		return <div className="py-10 text-[#313957]">Loading dispute details...</div>;
	}

	if (!dispute) {
		return <div className="py-10 text-red-500">{error || 'Dispute not found'}</div>;
	}

	const isUnresolved = dispute.status === DisputeStatus.UNRESOLVED;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#0C1421] lg:text-[32px]">
					Dispute Details
				</h1>
				<Link
					href="/disputes"
					className="mt-2 inline-flex items-center gap-2 text-[14px] font-medium text-[#2563EB]"
				>
					<ArrowLeft className="size-4" /> Back to Disputes
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_335px]">
				<Card className="rounded-[16px] border-none bg-white p-6 shadow-sm">
					<div className="mb-5 flex items-start justify-between gap-4">
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-[39px] items-center justify-center rounded-full bg-[#ADADD7] text-[18px] font-bold text-[#424290]">
								{getInitials(dispute.lead.customerName)}
							</div>
							<div>
								<div className="text-[14px] text-black">Customer Name</div>
								<div className="text-[14px] font-semibold text-[#313957]">
									{dispute.lead.customerName}
								</div>
							</div>
						</div>
						<span className={cn('rounded-full px-3 py-1 text-[12px] font-medium', statusClass(dispute.status))}>
							{statusLabel(dispute.status)}
						</span>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<DetailItem label="Number" value={dispute.lead.customerNumber} icon={<Phone size={14} />} />
						<DetailItem label="Loan Type" value={dispute.lead.loanType} icon={<Wallet size={14} />} />
						<DetailItem label="Created By" value={dispute.agent.name} icon={<User size={14} />} />
						<DetailItem label="Updated At" value={formatDate(dispute.lead.updatedAt)} icon={<Calendar size={14} />} />
						<DetailItem label="Loan Officer" value={dispute.loanOfficer.name} icon={<Briefcase size={14} />} />
						<DetailItem label="Campaign" value={dispute.lead.campaign} icon={<Megaphone size={14} />} />
						<DetailItem label="Current Lead Status" value={leadStatusLabel(dispute.lead.status)} icon={<Wallet size={14} />} />
					</div>

					{dispute.lead.recordingLink ? (
						<Button asChild className="mt-5 h-[42px] rounded-[10px] bg-[#2563EB] text-white">
							<a href={dispute.lead.recordingLink} target="_blank" rel="noreferrer">
								<ExternalLink className="mr-2 size-4" /> Open Recording
							</a>
						</Button>
					) : null}
				</Card>

				<Card className="rounded-[16px] border-none bg-white p-6 shadow-sm">
					<h2 className="mb-5 text-[18px] font-semibold text-[#0C1421]">
						Parties Involved
					</h2>
					<div className="flex flex-col gap-4">
						<div className="rounded-[12px] border border-[#D4D7E3] p-4">
							<div className="text-[12px] text-[#8897AD]">Agent</div>
							<div className="font-semibold text-[#0C1421]">{dispute.agent.name}</div>
						</div>

						<div className="rounded-[12px] border border-[#D4D7E3] p-4">
							<div className="text-[12px] text-[#8897AD]">Loan Officer</div>
							<div className="font-semibold text-[#0C1421]">{dispute.loanOfficer.name}</div>
						</div>
					</div>
				</Card>
			</div>

			{dispute.decisionNotes ? (
				<Card className="rounded-[16px] border-none bg-[#FFFDF0] p-6 shadow-sm">
					<h2 className="mb-3 text-[18px] font-semibold text-[#0C1421]">
						Decision Notes
					</h2>
					<p className="whitespace-pre-wrap text-[14px] italic text-[#313957]">
						{dispute.decisionNotes}
					</p>
				</Card>
			) : null}

			<Card className="rounded-[16px] border-none bg-white p-6 shadow-sm">
				<div className="mb-8 flex items-start justify-between gap-4">
					<div>
						<h2 className="text-[18px] font-semibold text-[#0C1421]">
							Resolve Dispute
						</h2>
						<p className="text-[14px] text-[#313957]">
							Listen to the recording, then choose the final lead billing status.
						</p>
					</div>
					<span className={cn('rounded-full px-3 py-1 text-[12px] font-medium', statusClass(dispute.status))}>
						{statusLabel(dispute.status)}
					</span>
				</div>

				<div className="flex flex-col gap-5">
					<div>
						<div className="mb-2 text-[14px] font-medium text-[#313957]">
							Final Decision
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{DECISION_OPTIONS.map((option) => (
								<label
									key={option.value}
									className={cn(
										'flex cursor-pointer items-center gap-3 rounded-[12px] border border-[#D4D7E3] p-5',
										decision === option.value && 'border-[#2563EB] bg-[#EFF6FF]',
										(!canResolve || !isUnresolved) && 'cursor-default opacity-80',
									)}
								>
									<input
										type="radio"
										checked={decision === option.value}
										disabled={!canResolve || !isUnresolved}
										onChange={() => setDecision(option.value)}
									/>
									<span>
										<span className="block font-medium text-[#0C1421]">{option.title}</span>
										<span className="text-[13px] text-[#8897AD]">{option.subtitle}</span>
									</span>
								</label>
							))}
						</div>
					</div>

					<div>
						<label className="mb-2 block text-[14px] font-medium text-[#313957]">
							Decision Notes
						</label>
						<textarea
							value={decisionNotes}
							disabled={!canResolve || !isUnresolved}
							onChange={(event) => setDecisionNotes(event.target.value)}
							placeholder="Enter the reason for your decision..."
							className="min-h-[90px] w-full rounded-[12px] border border-[#D4D7E3] p-4 text-[14px] text-[#313957] placeholder:text-[#8897AD] focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
						/>
					</div>

					{error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
					{message ? <p className="text-sm font-medium text-green-600">{message}</p> : null}

					{canResolve && isUnresolved ? (
						<div className="flex justify-end">
							<Button
								type="button"
								onClick={submitDecision}
								disabled={isSubmitting}
								className="h-[48px] rounded-[8px] bg-[#2563EB] px-8 text-white"
							>
								{isSubmitting ? 'Submitting...' : 'Submit Decision'}
							</Button>
						</div>
					) : null}
				</div>
			</Card>
		</div>
	);
}