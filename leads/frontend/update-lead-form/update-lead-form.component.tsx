'use client';

import { Check, DollarSign, Home, Phone, User, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	CALL_TRANSFER_CREDIT_RATINGS,
	CALL_TRANSFER_LOAN_PURPOSES,
	CALL_TRANSFER_LOAN_TYPES,
} from '@/common/constants/call-transfer-lead-options';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import { cn } from '@/lib/utils';
import { useUpdateLeadFormHook } from './update-lead-form.hook';

interface UpdateLeadFormProps {
	id: string;
}

type ReadOnlyFieldProps = {
	label: string;
	value: string;
	icon: React.ReactNode;
};

type TextFieldProps = {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	required?: boolean;
	icon?: React.ReactNode;
};

function ReadOnlyField({ label, value, icon }: ReadOnlyFieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<label className="text-[16px] font-medium text-[#313957]">{label}</label>
			<div className="relative flex h-[58px] min-w-0 items-center overflow-hidden rounded-[12px] border border-[#D4D7E3] bg-gray-50 pl-11 pr-4 text-[16px] text-[#313957]">
				<span className="absolute left-4 text-[#26395C]">{icon}</span>
				<span className="block min-w-0 truncate" title={value || 'N/A'}>
					{value || 'N/A'}
				</span>
			</div>
		</div>
	);
}

function TextField({
	id,
	label,
	value,
	onChange,
	type = 'text',
	required,
	icon,
}: TextFieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className="text-[16px] font-medium text-[#313957]">
				{label}
			</Label>
			<div className="relative">
				{icon ? (
					<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#26395C]">
						{icon}
					</span>
				) : null}
				<Input
					id={id}
					type={type}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					required={required}
					className={cn(
						'h-[58px] rounded-[12px] border-[#D4D7E3] bg-white text-[16px] text-[#313957] focus-visible:ring-blue-500',
						icon && 'pl-12',
					)}
				/>
			</div>
		</div>
	);
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

	const canUpdateLeadStatus = !form.isManager;
	const canUpdatePaymentStatus = form.isAdmin
		? form.status === LeadStatus.BILLABLE
		: form.isManager && form.status !== LeadStatus.BILLABLE;
	const formattedCurrentStatus =
		form.status.charAt(0).toUpperCase() + form.status.slice(1);
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
			<div className="flex flex-col gap-1">
				<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold text-[#313957] lg:text-[32px] lg:text-[#0C1421]">
					{form.isAdmin
						? 'Edit Lead'
						: form.isManager
							? 'Update Lead Payment'
							: 'Update Lead Status'}
				</h1>
				{form.isAdmin ? (
					<p className="text-[14px] font-medium text-[#313957]">
						Admin can correct lead information and reassign active loan
						officers.
					</p>
				) : null}
				{form.isManager ? (
					<p className="text-[14px] font-medium text-[#313957]">
						Managers can update payment status for pending and non-billable team
						leads.
					</p>
				) : null}
			</div>

			<Card className="relative w-full rounded-[24px] border-none bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:p-10">
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8">
					{form.isAdmin ? (
						<>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
								<TextField
									id="customerName"
									label="Customer Name"
									value={form.customerName}
									onChange={form.setCustomerName}
									required
									icon={<User size={18} />}
								/>
								<TextField
									id="customerNumber"
									label="Number"
									value={form.customerNumber}
									onChange={form.setCustomerNumber}
									required
									icon={<Phone size={18} />}
								/>
							</div>

							<TextField
								id="username"
								label="Username"
								value={form.username}
								onChange={form.setUsername}
								required
								icon={<User size={18} />}
							/>

							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
								<div className="flex flex-col gap-2">
									<Label className="text-[16px] font-medium text-[#313957]">
										Campaign
									</Label>
									<Select
										value={form.campaign}
										onValueChange={form.setCampaign}
									>
										<SelectTrigger className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white text-[16px] text-[#313957]">
											<SelectValue placeholder="Select Campaign" />
										</SelectTrigger>
										<SelectContent>
											{form.campaignOptions.map((campaign) => (
												<SelectItem key={campaign} value={campaign}>
													{campaign}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex flex-col gap-2">
									<Label className="text-[16px] font-medium text-[#313957]">
										Loan Type
									</Label>
									<Select
										value={form.loanType}
										onValueChange={(value) =>
											form.setLoanType(value as LoanType)
										}
									>
										<SelectTrigger className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white text-[16px] text-[#313957]">
											<SelectValue placeholder="Select Loan Type" />
										</SelectTrigger>
										<SelectContent>
											{Object.values(LoanType).map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
								<div className="flex flex-col gap-2">
									<Label className="text-[16px] font-medium text-[#313957]">
										Loan Officer
									</Label>
									<Select
										value={form.loanOfficerId || 'none'}
										onValueChange={(value) =>
											form.setLoanOfficerId(value === 'none' ? '' : value)
										}
									>
										<SelectTrigger className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white text-[16px] text-[#313957]">
											<SelectValue placeholder="Select Loan Officer" />
										</SelectTrigger>
										<SelectContent>
											{form.leadType === 'standard' ? (
												<SelectItem value="none">No Loan Officer</SelectItem>
											) : null}
											{form.loanOfficerOptions.map((loanOfficer) => (
												<SelectItem key={loanOfficer.id} value={loanOfficer.id}>
													{loanOfficer.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-[12px] text-[#6B7A99]">
										Phone:{' '}
										{form.loanOfficerPhoneNumber || 'Select a loan officer'}
									</p>
								</div>

								<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
									<TextField
										id="loanBalance"
										label="Loan Balance"
										type="number"
										value={form.loanBalance}
										onChange={form.setLoanBalance}
										icon={<DollarSign size={18} />}
									/>
									<TextField
										id="homeValue"
										label="Home Value"
										type="number"
										value={form.homeValue}
										onChange={form.setHomeValue}
										icon={<Home size={18} />}
									/>
								</div>
							</div>

							{form.leadType === 'call_transfer' ? (
								<div className="rounded-[18px] border border-[#BFDBFE] bg-[#F8FBFF] p-5">
									<h2 className="mb-5 text-[18px] font-semibold text-[#1D4ED8]">
										Call Transfer Details
									</h2>
									<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
										<TextField
											id="firstName"
											label="First Name"
											value={form.callTransfer.firstName}
											onChange={(value) =>
												form.updateCallTransferField('firstName', value)
											}
											required
										/>
										<TextField
											id="lastName"
											label="Last Name"
											value={form.callTransfer.lastName}
											onChange={(value) =>
												form.updateCallTransferField('lastName', value)
											}
											required
										/>
										<TextField
											id="originPhone"
											label="Origin Phone"
											value={form.callTransfer.originPhone}
											onChange={(value) =>
												form.updateCallTransferField('originPhone', value)
											}
											required
										/>
										<TextField
											id="email"
											label="Email"
											value={form.callTransfer.email}
											onChange={(value) =>
												form.updateCallTransferField('email', value)
											}
										/>
										<TextField
											id="address"
											label="Address"
											value={form.callTransfer.address}
											onChange={(value) =>
												form.updateCallTransferField('address', value)
											}
											required
										/>
										<TextField
											id="city"
											label="City"
											value={form.callTransfer.city}
											onChange={(value) =>
												form.updateCallTransferField('city', value)
											}
											required
										/>
										<TextField
											id="state"
											label="State"
											value={form.callTransfer.state}
											onChange={(value) =>
												form.updateCallTransferField('state', value)
											}
											required
										/>
										<TextField
											id="zip"
											label="ZIP"
											value={form.callTransfer.zip}
											onChange={(value) =>
												form.updateCallTransferField('zip', value)
											}
											required
										/>
										<TextField
											id="callTransferHomeValue"
											label="Call Transfer Home Value"
											type="number"
											value={form.callTransfer.homeValue}
											onChange={(value) =>
												form.updateCallTransferField('homeValue', value)
											}
											required
										/>
										<TextField
											id="mortgageBalance"
											label="Mortgage Balance"
											type="number"
											value={form.callTransfer.mortgageBalance}
											onChange={(value) =>
												form.updateCallTransferField('mortgageBalance', value)
											}
											required
										/>
										<TextField
											id="mortgageRateType"
											label="Mortgage Rate Type"
											value={form.callTransfer.mortgageRateType}
											onChange={(value) =>
												form.updateCallTransferField('mortgageRateType', value)
											}
										/>
										<TextField
											id="propertyType"
											label="Property Type"
											value={form.callTransfer.propertyType}
											onChange={(value) =>
												form.updateCallTransferField('propertyType', value)
											}
										/>
										<TextField
											id="mortgageRate"
											label="Mortgage Rate"
											type="number"
											value={form.callTransfer.mortgageRate}
											onChange={(value) =>
												form.updateCallTransferField('mortgageRate', value)
											}
										/>
										<TextField
											id="cashOutAmount"
											label="Cash Out Amount"
											type="number"
											value={form.callTransfer.cashOutAmount}
											onChange={(value) =>
												form.updateCallTransferField('cashOutAmount', value)
											}
										/>
									</div>

									<div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
										<div className="flex flex-col gap-2">
											<Label>Multiple Properties</Label>
											<Select
												value={form.callTransfer.multipleProperties}
												onValueChange={(value) =>
													form.updateCallTransferField(
														'multipleProperties',
														value as 'Yes' | 'No',
													)
												}
											>
												<SelectTrigger className="h-[58px] rounded-[12px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="No">No</SelectItem>
													<SelectItem value="Yes">Yes</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-col gap-2">
											<Label>Call Transfer Loan Type</Label>
											<Select
												value={form.callTransfer.loanType}
												onValueChange={(value) =>
													form.updateCallTransferField(
														'loanType',
														value as (typeof CALL_TRANSFER_LOAN_TYPES)[number],
													)
												}
											>
												<SelectTrigger className="h-[58px] rounded-[12px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{CALL_TRANSFER_LOAN_TYPES.map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-col gap-2">
											<Label>Loan Purpose</Label>
											<Select
												value={form.callTransfer.loanPurpose}
												onValueChange={(value) =>
													form.updateCallTransferField(
														'loanPurpose',
														value as (typeof CALL_TRANSFER_LOAN_PURPOSES)[number],
													)
												}
											>
												<SelectTrigger className="h-[58px] rounded-[12px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{CALL_TRANSFER_LOAN_PURPOSES.map((purpose) => (
														<SelectItem key={purpose} value={purpose}>
															{purpose}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="flex flex-col gap-2">
											<Label>Credit</Label>
											<Select
												value={form.callTransfer.credit}
												onValueChange={(value) =>
													form.updateCallTransferField(
														'credit',
														value as (typeof CALL_TRANSFER_CREDIT_RATINGS)[number],
													)
												}
											>
												<SelectTrigger className="h-[58px] rounded-[12px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{CALL_TRANSFER_CREDIT_RATINGS.map((credit) => (
														<SelectItem key={credit} value={credit}>
															{credit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
							) : null}
						</>
					) : (
						<>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
								<ReadOnlyField
									label="Customer Name"
									value={form.customerName}
									icon={<User size={16} />}
								/>
								<ReadOnlyField
									label="Number"
									value={form.customerNumber}
									icon={<Phone size={16} />}
								/>
							</div>
							<ReadOnlyField
								label="Username"
								value={form.username}
								icon={<User size={16} />}
							/>
							<ReadOnlyField
								label="Loan Type"
								value={form.loanType}
								icon={<Wallet size={16} />}
							/>
							{form.isManager ? (
								<ReadOnlyField
									label="Current Status"
									value={formattedCurrentStatus}
									icon={<Check size={16} />}
								/>
							) : null}
							{form.isManager && form.status === LeadStatus.NON_BILLABLE ? (
								<ReadOnlyField
									label="Status Reason"
									value={form.statusReason}
									icon={<X size={16} />}
								/>
							) : null}
						</>
					)}

					{canUpdateLeadStatus ? (
						<div className="flex flex-col gap-4">
							<label className="text-[16px] font-medium text-[#313957]">
								New Status
							</label>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[966px]">
								{statusOptions.map((status) => (
									<button
										key={status}
										type="button"
										onClick={() => form.setStatus(status)}
										className={cn(
											'flex h-[58px] items-center justify-center rounded-[12px] border border-[#D4D7E3] text-[16px] transition-all',
											form.status === status
												? status === LeadStatus.NON_BILLABLE
													? 'border-[#D4D7E3] bg-[#FFE4E6]'
													: 'border-[#2563EB] bg-[#E5F0FF]'
												: 'bg-white',
										)}
									>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</button>
								))}
							</div>
						</div>
					) : null}

					{canUpdateLeadStatus && form.status === LeadStatus.NON_BILLABLE && (
						<div className="flex flex-col gap-2">
							<label className="text-[16px] font-medium text-[#313957]">
								Status Reason
							</label>
							<textarea
								value={form.statusReason}
								onChange={(event) => form.setStatusReason(event.target.value)}
								placeholder="e.g. Insufficient credit history"
								className="min-h-[117px] w-full rounded-[12px] border border-[#D4D7E3] p-4 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
						</div>
					)}

					{canUpdatePaymentStatus && (
						<div className="flex flex-col gap-4">
							<label className="text-[16px] font-medium text-[#313957]">
								Payment Status
							</label>
							<div className="grid grid-cols-2 gap-3 lg:w-[966px]">
								{(['unpaid', 'paid'] as const).map((payment) => (
									<button
										key={payment}
										type="button"
										onClick={() => form.setPaymentStatus(payment)}
										className={cn(
											'flex h-[58px] items-center justify-center rounded-[12px] border border-[#D4D7E3] text-[16px] transition-all',
											form.paymentStatus === payment
												? payment === 'paid'
													? 'border-[#10B981] bg-[#D1FAE5]'
													: 'border-[#F43F5E] bg-[#FFE4E6]'
												: 'bg-white',
										)}
									>
										{payment.charAt(0).toUpperCase() + payment.slice(1)}
									</button>
								))}
							</div>
						</div>
					)}

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
			</Card>
		</div>
	);
}
