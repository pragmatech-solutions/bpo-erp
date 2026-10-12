'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	INSELLERATE_CLIENTS,
	INSELLERATE_EMPLOYMENT_STATUSES,
	INSELLERATE_LOAN_TYPES,
	INSELLERATE_VETERAN_OPTIONS,
} from '@/common/constants/insellerate-lead-options';
import {
	InsellerateField,
	InsellerateSelectField,
} from './insellerate-lead-fields.component';
import { useInsellerateLeadFormHook } from './insellerate-lead-form.hook';

const sectionTitle = 'mb-5 text-[20px] font-semibold text-[#313957]';
const grid = 'grid grid-cols-1 gap-5 md:grid-cols-2';

export function InsellerateLeadForm() {
	const form = useInsellerateLeadFormHook();
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
					Insellerate Lead
				</h1>
				<p className="text-[16px] font-medium text-[#313957]">
					All fields marked with * are required
				</p>
			</div>

			<Card className="max-w-[1034px] rounded-[24px] border-none bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:p-8">
				<form onSubmit={form.handleSubmit} className="flex flex-col gap-8">
					<section>
						<h2 className={sectionTitle}>Client / Campaign</h2>
						<InsellerateSelectField
							id="clientCampaign"
							label="Client"
							value={values.client_campaign}
							placeholder="Select client"
							options={INSELLERATE_CLIENTS}
							onChange={(value) => updateField('client_campaign', value)}
							required
						/>
					</section>

					<section>
						<h2 className={sectionTitle}>Borrower Information</h2>
						<div className={grid}>
							<InsellerateField
								id="firstName"
								label="First Name"
								required
								maxLength={50}
								value={values.first_name}
								onChange={(value) => updateField('first_name', value)}
							/>
							<InsellerateField
								id="lastName"
								label="Last Name"
								required
								maxLength={50}
								value={values.last_name}
								onChange={(value) => updateField('last_name', value)}
							/>
							<InsellerateField
								id="city"
								label="City"
								required
								maxLength={32}
								value={values.city}
								onChange={(value) => updateField('city', value)}
							/>
							<InsellerateField
								id="state"
								label="State"
								required
								maxLength={2}
								placeholder="CA"
								hint="Use the 2-letter state code, for example CA, TX or FL."
								value={values.state}
								onChange={(value) => updateField('state', value)}
							/>
							<InsellerateField
								id="address"
								label="Address"
								maxLength={100}
								placeholder="123 Main St"
								value={values.address}
								onChange={(value) => updateField('address', value)}
							/>
							<InsellerateField
								id="zip"
								label="Zip Code"
								required
								maxLength={10}
								value={values.zip}
								onChange={(value) => updateField('zip', value)}
							/>
							<InsellerateField
								id="email"
								label="Email"
								type="email"
								maxLength={255}
								value={values.email}
								onChange={(value) => updateField('email', value)}
							/>
							<InsellerateField
								id="mobile"
								label="Mobile Phone"
								required
								type="tel"
								maxLength={25}
								value={values.mobile}
								onChange={(value) => updateField('mobile', value)}
							/>
						</div>
					</section>

					<section>
						<h2 className={sectionTitle}>Mortgage Information</h2>
						<div className={grid}>
							<InsellerateField
								id="mortgageBalance"
								label="Mortgage Balance"
								type="number"
								min={0}
								step={0.01}
								value={values.mortgage_balance}
								onChange={(value) => updateField('mortgage_balance', value)}
							/>
							<InsellerateField
								id="loanAmount"
								label="Loan Amount"
								type="number"
								min={0}
								step={0.01}
								value={values.loan_amount}
								onChange={(value) => updateField('loan_amount', value)}
							/>
							<InsellerateField
								id="interestRate"
								label="Interest Rate"
								type="number"
								min={0}
								max={100}
								step={0.001}
								placeholder="6.250"
								value={values.interest_rate}
								onChange={(value) => updateField('interest_rate', value)}
							/>
							<InsellerateField
								id="creditScore"
								label="Credit Score"
								type="number"
								min={300}
								max={850}
								value={values.credit_score}
								onChange={(value) => updateField('credit_score', value)}
							/>
							<InsellerateSelectField
								id="veteran"
								label="Veteran"
								placeholder="Select"
								options={INSELLERATE_VETERAN_OPTIONS}
								value={values.veteran}
								onChange={(value) => updateField('veteran', value)}
							/>
							<InsellerateSelectField
								id="loanType"
								label="Loan Type"
								placeholder="Select loan type"
								options={INSELLERATE_LOAN_TYPES}
								value={values.loan_type}
								onChange={(value) => updateField('loan_type', value)}
							/>
							<InsellerateSelectField
								id="employmentStatus"
								label="Employment Status"
								placeholder="Select employment status"
								options={INSELLERATE_EMPLOYMENT_STATUSES}
								value={values.employment_status}
								onChange={(value) => updateField('employment_status', value)}
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
							Insellerate lead created successfully.
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
	);
}
