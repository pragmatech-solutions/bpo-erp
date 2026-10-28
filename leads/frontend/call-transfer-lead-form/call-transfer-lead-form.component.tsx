'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Home, Phone, User, X } from 'lucide-react';
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
	onClear,
}: {
	id: string;
	label: string;
	value: string;
	placeholder: string;
	options: readonly (string | { value: string; label: string })[];
	required?: boolean;
	onChange: (value: string) => void;
	onClear?: () => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className="text-[14px] font-medium text-[#313957]">
				{label}
				{required ? ' *' : ''}
			</Label>
			<div className="flex items-center gap-2">
				<Select value={value} onValueChange={onChange}>
					<SelectTrigger
						id={id}
						className="h-[52px] flex-1 rounded-[12px] border-[#D4D7E3] bg-white px-4 text-[15px] text-[#313957]"
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
				{onClear && value ? (
					<Button
						type="button"
						variant="outline"
						size="icon"
						title={`Clear ${label.toLowerCase()}`}
						aria-label={`Clear ${label.toLowerCase()}`}
						onClick={onClear}
						className="size-[52px] shrink-0 rounded-[12px] border-[#D4D7E3] text-[#6B7A99] hover:bg-[#F8FBFF] hover:text-[#26395C]"
					>
						<X className="size-4" />
					</Button>
				) : null}
			</div>
		</div>
	);
}

function TextAreaField({
	id,
	label,
	value,
	placeholder,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={id} className="text-[14px] font-medium text-[#313957]">
				{label}
			</Label>
			<textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="min-h-[116px] w-full rounded-[12px] border border-[#D4D7E3] bg-white p-4 text-[15px] text-[#313957] placeholder:text-[#8897AD] focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</div>
	);
}

function ScriptPanel({
	loanOfficerPhone,
	loanOfficerCriteria,
	hasSelectedLoanOfficer,
	content,
}: {
	loanOfficerPhone?: string;
	loanOfficerCriteria?: string;
	hasSelectedLoanOfficer: boolean;
	content: string;
}) {
	return (
		<div className="flex flex-col gap-5 rounded-[18px] bg-[#FFF6CC] p-5 text-[14px] leading-6 text-[#0C1421] shadow-sm lg:sticky lg:top-6">
			<div className="rounded-[12px] bg-white/70 p-4">
				<p className="mb-3 font-semibold">Call Sheet Information</p>
				<div
					className="[&_h2]:mb-4 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:my-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>

			<div className="rounded-[12px] bg-white/70 p-4">
				<p className="font-semibold">Criteria</p>
				<p className="mt-1 whitespace-pre-wrap break-words text-[#26395C]">
					{hasSelectedLoanOfficer
						? loanOfficerCriteria || 'No criteria set'
						: 'Select a loan officer'}
				</p>
			</div>

			<div className="rounded-[12px] bg-white/70 p-4">
				<p className="font-semibold">Loan Officer Number</p>
				<p className="mt-1 break-words text-[#2563EB]">
					{loanOfficerPhone || 'Select a loan officer'}
				</p>
			</div>
		</div>
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

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
				<ScriptPanel
					loanOfficerPhone={form.selectedLoanOfficer?.phoneNumber}
					loanOfficerCriteria={form.selectedLoanOfficer?.criteria}
					hasSelectedLoanOfficer={Boolean(form.selectedLoanOfficer)}
					content={form.callTransferSheetContent}
				/>

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
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2">
									<button
										type="button"
										disabled
										className="flex h-[52px] items-center justify-center rounded-[12px] bg-[#1E9AB0] px-4 text-center text-[15px] font-semibold text-white disabled:opacity-100"
									>
										LTV: {form.existingLtv.toFixed(1)}%
									</button>
									<button
										type="button"
										disabled
										className="flex h-[52px] items-center justify-center rounded-[12px] bg-[#16A34A] px-4 text-center text-[15px] font-semibold text-white disabled:opacity-100"
									>
										LTV w/ Cash Out: {form.cashOutLtv.toFixed(1)}%
									</button>
								</div>
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
									onClear={() => updateField('loan_officer_id', '')}
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
							<div className="mt-5 grid grid-cols-1 gap-5">
								<Field
									id="recordingLink"
									label="Recording Link"
									type="url"
									placeholder="https://example.com/recording"
									value={values.recording_link || ''}
									onChange={(value) => updateField('recording_link', value)}
								/>
								<TextAreaField
									id="agentComment"
									label="Agent Comments"
									value={values.agent_comment || ''}
									placeholder="Add any notes for this lead"
									onChange={(value) => updateField('agent_comment', value)}
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
			</div>
		</div>
	);
}
