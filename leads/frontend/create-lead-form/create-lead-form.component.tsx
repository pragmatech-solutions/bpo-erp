'use client';

import { User, Phone, Briefcase, DollarSign, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateLeadFormHook } from './create-lead-form.hook';

export function CreateLeadForm() {
	const {
		customerName,
		setCustomerName,
		customerNumber,
		setCustomerNumber,
		loanType,
		setLoanType,
		loanBalance,
		setLoanBalance,
		homeValue,
		setHomeValue,
		errorMessage,
		isLoading,
		success,
		handleSubmit,
		handleCancel,
	} = useCreateLeadFormHook();

	return (
		<div className="flex flex-col gap-8">
			<h1 className="font-[var(--font-poppins)] text-[24px] font-semibold tracking-[0.01em] text-[#0C1421] lg:text-[32px]">
				Create Lead
			</h1>

			<Card className="w-full max-w-[1034px] rounded-[24px] border-none bg-white p-6 shadow-[0px_4px_4px_-3px_rgba(0,0,0,0.25)] lg:p-10">
				<div className="mb-6 flex flex-col gap-1">
					<h2 className="text-[18px] font-semibold text-[#0C1421] lg:text-[20px]">
						Lead Information
					</h2>
					<p className="text-[14px] font-medium text-[#313957] lg:text-[16px]">
						All fields marked with * are required
					</p>
				</div>

				<div className="mb-8 h-px w-full bg-[#D4D7E3]" />

				<form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-8">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
						<div className="flex flex-col gap-3">
							<Label
								htmlFor="customerName"
								className="text-[16px] font-medium text-[#313957]"
							>
								Customer Name *
							</Label>
							<div className="relative">
								<User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
								<Input
									id="customerName"
									type="text"
									placeholder="e.g. Ahmad Malik"
									value={customerName}
									onChange={(e) => setCustomerName(e.target.value)}
									required
									className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<Label
								htmlFor="customerNumber"
								className="text-[16px] font-medium text-[#313957]"
							>
								Number *
							</Label>
							<div className="relative">
								<Phone className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
								<Input
									id="customerNumber"
									type="text"
									placeholder="e.g. +92 3123214145"
									value={customerNumber}
									onChange={(e) => setCustomerNumber(e.target.value)}
									required
									className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
								/>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<Label
							htmlFor="loanType"
							className="text-[16px] font-medium text-[#313957]"
						>
							Loan Type *
						</Label>
						<div className="relative">
							<Briefcase className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
							<select
								id="loanType"
								value={loanType}
								onChange={(e) => setLoanType(e.target.value)}
								required
								className="h-[58px] w-full appearance-none rounded-[12px] border border-[#D4D7E3] bg-white pl-12 pr-4 text-[16px] text-[#313957] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
							>
								<option value="" disabled>
									Select Loan Type
								</option>
								<option value="Conventional">Conventional</option>
								<option value="FHA">FHA</option>
								<option value="VA">VA</option>
								<option value="VA eligible">VA eligible</option>
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#26395C]">
								<svg
									className="h-4 w-4 fill-current"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
								>
									<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
								</svg>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
						<div className="flex flex-col gap-3">
							<Label
								htmlFor="loanBalance"
								className="text-[16px] font-medium text-[#313957]"
							>
								Loan Balance
							</Label>
							<div className="relative">
								<DollarSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
								<Input
									id="loanBalance"
									type="number"
									placeholder="e.g. 250000"
									value={loanBalance}
									onChange={(e) => setLoanBalance(e.target.value)}
									className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
								/>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<Label
								htmlFor="homeValue"
								className="text-[16px] font-medium text-[#313957]"
							>
								Home Value
							</Label>
							<div className="relative">
								<Home className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
								<Input
									id="homeValue"
									type="number"
									placeholder="e.g. 350000"
									value={homeValue}
									onChange={(e) => setHomeValue(e.target.value)}
									className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
								/>
							</div>
						</div>
					</div>

					{errorMessage && (
						<p className="text-sm font-medium text-red-500">{errorMessage}</p>
					)}

					{success && (
						<p className="text-sm font-medium text-green-500">
							Lead created successfully!
						</p>
					)}

					<div className="mt-4 flex flex-col gap-4 lg:flex-row lg:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							className="h-[45px] w-full rounded-[12px] border-[#D4D7E3] text-[16px] font-medium text-[#313957] lg:h-[54px] lg:w-[195px] lg:text-[20px]"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="h-[45px] w-full rounded-[12px] bg-[#2563EB] text-[16px] font-medium text-white hover:bg-blue-700 lg:h-[54px] lg:w-[195px] lg:text-[20px]"
						>
							{isLoading ? 'Creating...' : 'Create Lead'}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}
