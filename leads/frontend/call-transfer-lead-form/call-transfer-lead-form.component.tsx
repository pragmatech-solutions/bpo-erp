'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calculator, Home, Phone, User } from 'lucide-react';
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
import type { CreateCallTransferLeadInput } from '@/leads/backend/create-call-transfer-lead/create-call-transfer-lead.input-schema';
import { useCallTransferLeadFormHook } from './call-transfer-lead-form.hook';

type FieldProps = {
	id: string;
	label: string;
	value: string;
	placeholder?: string;
	type?: string;
	required?: boolean;
	icon?: ReactNode;
	onChange: (value: string) => void;
	disabled?: boolean;
};

function Field({
	id,
	label,
	value,
	placeholder,
	type = 'text',
	required,
	icon,
	onChange,
	disabled,
}: FieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className="text-[14px] font-medium text-[#313957]">
				{label}
				{required ? ' *' : ''}
			</Label>
			<div className="relative">
				{icon ? (
					<span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#26395C]">
						{icon}
					</span>
				) : null}
				<Input
					id={id}
					type={type}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					className={`h-[52px] rounded-[12px] border-[#D4D7E3] bg-white text-[15px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500 ${icon ? 'pl-11' : ''}`}
				/>
			</div>
		</div>
	);
}

function SelectField({
	id,
	label,
	value,
	placeholder,
	options,
	required,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	placeholder: string;
	options: readonly (string | { value: string; label: string })[];
	required?: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className="text-[14px] font-medium text-[#313957]">
				{label}
				{required ? ' *' : ''}
			</Label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id={id}
					className="h-[52px] rounded-[12px] border-[#D4D7E3] bg-white px-4 text-[15px] text-[#313957]"
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => {
						const item =
							typeof option === 'string'
								? { value: option, label: option }
								: option;

						return (
							<SelectItem key={item.value} value={item.value}>
								{item.label}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</div>
	);
}

function ScriptPanel({ loanOfficerPhone }: { loanOfficerPhone?: string }) {
	return (
		<div className="flex flex-col gap-5 rounded-[18px] bg-[#FFF6CC] p-5 text-[14px] leading-6 text-[#0C1421] shadow-sm lg:sticky lg:top-6">
			<div className="rounded-[12px] bg-white/70 p-4 text-center">
				<h2 className="text-[24px] font-bold tracking-wide">QUALIFIERS</h2>
				<ul className="mt-4 space-y-2 text-left font-semibold">
					<li>$200,000+ Loan Amount</li>
					<li>75% LTV Max</li>
					<li>Cash Out Only</li>
					<li>No Bankruptcy, last two years</li>
					<li>No Mortgage lates, last 12 months</li>
					<li>Has Household Income</li>
					<li>MUST WANT TO SPEAK TO A LOAN OFFICER TO GET APPROVED</li>
				</ul>
				<p className="mt-4 font-semibold">
					Transfer Schedule 11am - 8pm Eastern Standard Time
				</p>
			</div>

			<div className="rounded-[12px] bg-white/70 p-4">
				<p className="font-semibold">
					Loan Officer Number:{' '}
					<span className="text-[#2563EB]">
						{loanOfficerPhone || 'Select a loan officer'}
					</span>
				</p>
				<p className="mt-4">
					Hello. This is XXXXXXX calling on behalf of American Financial
					Network, how are you today?
				</p>
				<p className="mt-4">
					We are calling homeowners in your area to see if we can help them
					save money monthly or meet any other financial goals you may have.
				</p>
				<p className="mt-4">
					Do you have a need for money using the equity in your home, it can
					be used for anything such as Cash Out, Debt Consolidation or Home
					Improvement? (Must answer yes)
				</p>
				<ul className="mt-4 list-disc space-y-2 pl-6">
					<li>Cash Out - Cash for anything you need</li>
					<li>Debt Consolidation - Payoff credit cards, loans, or bills</li>
					<li>Home Improvement - Roof, windows, extension, or repairs</li>
				</ul>
				<p className="mt-4">
					If YES: Ok, that is GREAT. I would like to ask you just a few
					questions to see if I can prequalify you to speak with a Loan
					Advisor.
				</p>
				<ul className="mt-4 list-disc space-y-2 pl-6">
					<li>Would you be using the money for Extra Cash?</li>
					<li>Is your home value about XXXXXXX?</li>
					<li>Is your mortgage balance about XXXXXXX?</li>
					<li>Do you have household income that would help qualify you?</li>
					<li>Have you had bankruptcy in the last 2 years?</li>
				</ul>
			</div>
		</div>
	);
}

function LtvPanel({
	homeValue,
	loanBalance,
	cashOutAmount,
	existingLtv,
	cashOutLtv,
}: {
	homeValue: string;
	loanBalance: string;
	cashOutAmount: string;
	existingLtv: number;
	cashOutLtv: number;
}) {
	return (
		<Card className="rounded-[18px] border-none bg-[#F1F5FB] p-5 shadow-sm">
			<div className="mb-5 flex items-center gap-2 text-[#313957]">
				<Calculator className="size-5" />
				<h2 className="text-[22px] font-semibold">LTV Calculator</h2>
			</div>
			<div className="space-y-4 text-[14px] text-[#313957]">
				<div>
					<span className="font-medium">Home Value</span>
					<p className="mt-1 rounded-[10px] bg-white px-3 py-2">
						{homeValue || '0'}
					</p>
				</div>
				<div>
					<span className="font-medium">Loan Balance</span>
					<p className="mt-1 rounded-[10px] bg-white px-3 py-2">
						{loanBalance || '0'}
					</p>
				</div>
				<div>
					<span className="font-medium">Cash Out</span>
					<p className="mt-1 rounded-[10px] bg-white px-3 py-2">
						{cashOutAmount || '0'}
					</p>
				</div>
				<div className="rounded-[12px] bg-[#1E9AB0] p-4 text-center font-semibold text-white">
					LTV: {existingLtv.toFixed(1)}%
				</div>
				<div className="rounded-[12px] bg-[#16A34A] p-4 text-center font-semibold text-white">
					LTV w/ Cash Out: {cashOutLtv.toFixed(1)}%
				</div>
			</div>
		</Card>
	);
}

export function CallTransferLeadForm() {
	const form = useCallTransferLeadFormHook();
	const { values, updateField } = form;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<Link
					href="/leads/create"
					className="inline-flex items-center gap-2 text-[16px] font-medium text-[#2563EB]"
				>
					<ArrowLeft className="size-4" /> Back to Create Lead
				</Link>
				<h1 className="font-[var(--font-poppins)] text-[30px] font-semibold tracking-[0.01em] text-[#0C1421] lg:text-[40px]">
					Call Transfer
				</h1>
				<p className="text-[16px] font-medium text-[#313957]">
					Lead Generation
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_240px]">
				<ScriptPanel loanOfficerPhone={form.selectedLoanOfficer?.phoneNumber} />

				<Card className="rounded-[24px] border-none bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:p-8">
					<form onSubmit={form.handleSubmit} className="flex flex-col gap-8">
						<section>
							<h2 className="mb-5 text-center text-[24px] font-semibold text-[#313957]">
								Contact Information
							</h2>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<Field
									id="firstName"
									label="First Name"
									value={values.first_name}
									onChange={(value) => updateField('first_name', value)}
									required
									icon={<User className="size-4" />}
								/>
								<Field
									id="lastName"
									label="Last Name"
									value={values.last_name}
									onChange={(value) => updateField('last_name', value)}
									required
									icon={<User className="size-4" />}
								/>
								<Field
									id="originPhone"
									label="Origin Phone"
									value={values.origin_phone}
									onChange={(value) => updateField('origin_phone', value)}
									required
									icon={<Phone className="size-4" />}
								/>
								<Field
									id="address"
									label="Address"
									value={values.address}
									onChange={(value) => updateField('address', value)}
									required
								/>
								<Field
									id="city"
									label="City"
									value={values.city}
									onChange={(value) => updateField('city', value)}
									required
								/>
								<Field
									id="state"
									label="State"
									value={values.state}
									onChange={(value) => updateField('state', value)}
									required
								/>
								<Field
									id="zip"
									label="ZIP"
									value={values.zip}
									onChange={(value) => updateField('zip', value)}
									required
								/>
								<Field
									id="email"
									label="Email"
									type="email"
									placeholder="optional"
									value={values.email || ''}
									onChange={(value) => updateField('email', value)}
								/>
							</div>
						</section>

						<section>
							<h2 className="mb-5 text-center text-[24px] font-semibold text-[#313957]">
								Property Information
							</h2>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<Field
									id="homeValue"
									label="Home Value"
									type="number"
									value={values.home_value}
									onChange={(value) => updateField('home_value', value)}
									required
									icon={<Home className="size-4" />}
								/>
								<Field
									id="mortgageBalance"
									label="Loan Balance"
									type="number"
									value={values.mortgage_balance}
									onChange={(value) => updateField('mortgage_balance', value)}
									required
								/>
								<Field
									id="mortgageRateType"
									label="Mortgage Rate Type"
									value={values.mortgage_rate_type || ''}
									onChange={(value) => updateField('mortgage_rate_type', value)}
									placeholder="e.g. Fixed"
								/>
								<Field
									id="propertyType"
									label="Property Type"
									value={values.property_type || ''}
									onChange={(value) => updateField('property_type', value)}
									placeholder="e.g. Single Family"
								/>
								<SelectField
									id="multipleProperties"
									label="Multiple Properties"
									value={values.multiple_properties}
									onChange={(value) =>
										updateField(
											'multiple_properties',
											value as CreateCallTransferLeadInput['multiple_properties'],
										)
									}
									placeholder="Select"
									options={['No', 'Yes']}
								/>
								<Field
									id="mortgageRate"
									label="Mortgage Rate"
									type="number"
									value={values.mortgage_rate}
									onChange={(value) => updateField('mortgage_rate', value)}
								/>
								<Field
									id="cashOutAmount"
									label="Cash Out Amount"
									type="number"
									value={values.cash_out_amount}
									onChange={(value) => updateField('cash_out_amount', value)}
								/>
							</div>
						</section>

						<section>
							<h2 className="mb-5 text-center text-[24px] font-semibold text-[#313957]">
								Other Information
							</h2>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<SelectField
									id="loanType"
									label="Loan Type"
									value={values.loan_type}
									onChange={(value) =>
										updateField(
											'loan_type',
											value as CreateCallTransferLeadInput['loan_type'],
										)
									}
									placeholder="Select loan type"
									options={CALL_TRANSFER_LOAN_TYPES}
									required
								/>
								<SelectField
									id="loanPurpose"
									label="Loan Purpose"
									value={values.loan_purpose}
									onChange={(value) =>
										updateField(
											'loan_purpose',
											value as CreateCallTransferLeadInput['loan_purpose'],
										)
									}
									placeholder="Select loan purpose"
									options={CALL_TRANSFER_LOAN_PURPOSES}
									required
								/>
								<SelectField
									id="credit"
									label="Credit"
									value={values.credit}
									onChange={(value) =>
										updateField(
											'credit',
											value as CreateCallTransferLeadInput['credit'],
										)
									}
									placeholder="Select credit"
									options={CALL_TRANSFER_CREDIT_RATINGS}
									required
								/>
								<SelectField
									id="loanOfficer"
									label="Loan Officer Name"
									value={values.loan_officer_id}
									onChange={(value) => updateField('loan_officer_id', value)}
									placeholder="Select loan officer"
									options={form.loanOfficerOptions.map((loanOfficer) => ({
										value: loanOfficer.id,
										label: loanOfficer.phoneNumber
											? `${loanOfficer.name} | ${loanOfficer.phoneNumber}`
											: loanOfficer.name,
									}))}
									required
								/>
								<Field
									id="loanOfficerNumber"
									label="Loan Officer Number"
									value={form.selectedLoanOfficer?.phoneNumber || ''}
									onChange={() => undefined}
									placeholder="Select a loan officer"
									disabled
									icon={<Briefcase className="size-4" />}
								/>
							</div>
						</section>

						{form.errorMessage ? (
							<p className="text-sm font-medium text-red-500">
								{form.errorMessage}
							</p>
						) : null}
						{form.success ? (
							<p className="text-sm font-medium text-green-600">
								Call transfer lead created successfully.
							</p>
						) : null}

						<div className="flex flex-col gap-4 md:flex-row md:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={form.handleCancel}
								className="h-[48px] rounded-[12px] md:w-[170px]"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={form.isLoading}
								className="h-[48px] rounded-[12px] bg-[#2563EB] text-white hover:bg-blue-700 md:w-[190px]"
							>
								{form.isLoading ? 'Submitting...' : 'Submit'}
							</Button>
						</div>
					</form>
				</Card>

				<LtvPanel
					homeValue={values.home_value}
					loanBalance={values.mortgage_balance}
					cashOutAmount={values.cash_out_amount}
					existingLtv={form.existingLtv}
					cashOutLtv={form.cashOutLtv}
				/>
			</div>
		</div>
	);
}




