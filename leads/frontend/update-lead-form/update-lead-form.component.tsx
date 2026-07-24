'use client';

import { useUpdateLeadFormHook } from './update-lead-form.hook';
import { Button } from '@/components/ui/button';
import { User, Phone, Wallet, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeadStatus } from '@/common/constants/lead-status.enum';

interface UpdateLeadFormProps {
	id: string;
}

export function UpdateLeadForm({ id }: UpdateLeadFormProps) {
	const {
		isLoading,
		isSubmitting,
		errorMessage,
		successMessage,
		form,
		handleSubmit,
		handleCancel,
	} = useUpdateLeadFormHook(id);

	const statusOptions =
		form.isQualityAssurance || form.isLoanOfficer
			? [LeadStatus.BILLABLE, LeadStatus.NON_BILLABLE]
			: Object.values(LeadStatus);

	if (isLoading) {
		return (
			<div className="flex h-[400px] items-center justify-center text-[#313957]">
				Loading lead details...
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 py-6 lg:py-10">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#313957] lg:text-[32px] lg:text-[#0C1421]">
				Update Lead Status
			</h1>

			<div className="relative w-full rounded-[24px] bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:p-10">
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8">
					{/* Name and Number Row - READ ONLY */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
						<div className="flex flex-col gap-2">
							<label className="text-[16px] font-medium text-[#313957]">
								Customer Name
							</label>
							<div className="relative flex h-[58px] items-center rounded-[12px] border border-[#D4D7E3] bg-gray-50 pl-11 text-[16px] text-[#313957]">
								<User className="absolute left-4 size-4 text-[#26395C]" />
								{form.customerName}
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-[16px] font-medium text-[#313957]">
								Number
							</label>
							<div className="relative flex h-[58px] items-center rounded-[12px] border border-[#D4D7E3] bg-gray-50 pl-11 text-[16px] text-[#313957]">
								<Phone className="absolute left-4 size-4 text-[#26395C]" />
								{form.customerNumber}
							</div>
						</div>
					</div>

					{/* Username Row - READ ONLY */}
					<div className="flex flex-col gap-2">
						<label className="text-[16px] font-medium text-[#313957]">
							Username
						</label>
						<div className="relative flex h-[58px] items-center rounded-[12px] border border-[#D4D7E3] bg-gray-50 pl-11 text-[16px] text-[#313957]">
							<User className="absolute left-4 size-4 text-[#26395C]" />
							{form.username}
						</div>
					</div>

					{/* Loan Type Row - READ ONLY */}
					<div className="flex flex-col gap-2">
						<label className="text-[16px] font-medium text-[#313957]">
							Loan Type
						</label>
						<div className="relative flex h-[58px] items-center rounded-[12px] border border-[#D4D7E3] bg-gray-50 pl-11 text-[16px] text-[#313957]">
							<Wallet className="absolute left-4 size-4 text-[#26395C]" />
							{form.loanType}
						</div>
					</div>

					{/* New Status Row - EDITABLE */}
					<div className="flex flex-col gap-4">
						<label className="text-[16px] font-medium text-[#313957]">
							New Status
						</label>
						<div className="grid grid-cols-3 gap-3 lg:w-[966px]">
							{statusOptions.map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => form.setStatus(s)}
									className={cn(
										'flex h-[58px] items-center justify-center rounded-[12px] border border-[#D4D7E3] text-[16px] transition-all',
										form.status === s
											? s === LeadStatus.NON_BILLABLE
												? 'bg-[#FFE4E6] border-[#D4D7E3]'
												: 'bg-[#E5F0FF] border-[#2563EB]'
											: 'bg-white',
									)}
								>
									{s.charAt(0).toUpperCase() + s.slice(1)}
								</button>
							))}
						</div>
					</div>

					{/* Status Reason Row - CONDITIONAL */}
					{form.status === LeadStatus.NON_BILLABLE && (
						<div className="flex flex-col gap-2">
							<label className="text-[16px] font-medium text-[#313957]">
								Status Reason
							</label>
							<textarea
								value={form.statusReason}
								onChange={(e) => form.setStatusReason(e.target.value)}
								placeholder="e.g. Insufficient credit history"
								className="min-h-[117px] w-full rounded-[12px] border border-[#D4D7E3] p-4 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					)}

					{form.status === LeadStatus.BILLABLE && form.isAdmin && (
						<div className="flex flex-col gap-4">
							<label className="text-[16px] font-medium text-[#313957]">
								Payment Status
							</label>
							<div className="grid grid-cols-2 gap-3 lg:w-[966px]">
								{(['unpaid', 'paid'] as const).map((p) => (
									<button
										key={p}
										type="button"
										onClick={() => form.setPaymentStatus(p)}
										className={cn(
											'flex h-[58px] items-center justify-center rounded-[12px] border border-[#D4D7E3] text-[16px] transition-all',
											form.paymentStatus === p
												? p === 'paid'
													? 'bg-[#D1FAE5] border-[#10B981]'
													: 'bg-[#FFE4E6] border-[#F43F5E]'
												: 'bg-white',
										)}
									>
										{p.charAt(0).toUpperCase() + p.slice(1)}
									</button>
								))}
							</div>
						</div>
					)}

					{form.status === LeadStatus.BILLABLE && form.isQualityAssurance && (
						<div className="flex flex-col gap-4">
							<label className="text-[16px] font-medium text-[#313957]">
								Payment Status
							</label>
							<div className="grid grid-cols-1 gap-3 lg:w-[966px]">
								<div className="flex h-[58px] items-center justify-center rounded-[12px] border border-[#F43F5E] bg-[#FFE4E6] text-[16px]">
									Unpaid
								</div>
							</div>
						</div>
					)}

					{/* Error/Success Messages */}
					{errorMessage && (
						<div className="flex items-center gap-2 text-red-500">
							<X className="size-4" />
							<span>{errorMessage}</span>
						</div>
					)}
					{successMessage && (
						<div className="flex items-center gap-2 text-green-500">
							<Check className="size-4" />
							<span>{successMessage}</span>
						</div>
					)}

					{/* Buttons Row */}
					<div className="flex flex-col gap-4 lg:flex-row lg:justify-end lg:gap-6 lg:pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							className="h-[45px] rounded-[12px] border-[#D4D7E3] text-[16px] font-medium text-[#313957] lg:h-[54px] lg:w-[195px]"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-[45px] rounded-[12px] bg-[#2563EB] text-[16px] font-medium text-white hover:bg-blue-700 lg:h-[54px] lg:w-[195px]"
						>
							{isSubmitting ? 'Updating...' : 'Update Lead'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
