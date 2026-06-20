'use client';

import { User, Phone, Briefcase, DollarSign, Home, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { LoanType } from '@/common/constants/loan-type.enum';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import { useCreateLeadFormHook } from './create-lead-form.hook';

export function CreateLeadForm() {
	const {
		customerName,
		setCustomerName,
		customerNumber,
		setCustomerNumber,
		campaign,
		setCampaign,
		loanType,
		setLoanType,
		loanBalance,
		setLoanBalance,
		homeValue,
		setHomeValue,
		loanOfficerName,
		setLoanOfficerName,
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
							htmlFor="campaign"
							className="text-[16px] font-medium text-[#313957]"
						>
							Campaign *
						</Label>
						<div className="relative">
							<Target className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-[#26395C]" />
							<Select value={campaign} onValueChange={setCampaign}>
								<SelectTrigger
									id="campaign"
									className="h-[58px] w-full rounded-[12px] border border-[#D4D7E3] bg-white pl-12 pr-4 text-[16px] text-[#313957] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 data-[placeholder]:text-[#8897AD]"
								>
									<SelectValue placeholder="Select Campaign" />
								</SelectTrigger>
								<SelectContent position="popper">
									{CAMPAIGNS.map((campaign) => (
										<SelectItem key={campaign} value={campaign}>
											{campaign}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<Label
							htmlFor="loanOfficerName"
							className="text-[16px] font-medium text-[#313957]"
						>
							Loan Officer Name (optional)
						</Label>
						<div className="relative">
							<User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#26395C]" />
							<Input
								id="loanOfficerName"
								type="text"
								placeholder="e.g. John Doe"
								value={loanOfficerName}
								onChange={(e) => setLoanOfficerName(e.target.value)}
								className="h-[58px] rounded-[12px] border-[#D4D7E3] bg-white pl-12 text-[16px] text-[#313957] placeholder:text-[#8897AD] focus-visible:ring-blue-500"
							/>
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
							<Briefcase className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-[#26395C]" />
							<Select value={loanType} onValueChange={setLoanType}>
								<SelectTrigger
									id="loanType"
									className="h-[58px] w-full rounded-[12px] border border-[#D4D7E3] bg-white pl-12 pr-4 text-[16px] text-[#313957] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 data-[placeholder]:text-[#8897AD]"
								>
									<SelectValue placeholder="Select Loan Type" />
								</SelectTrigger>
								<SelectContent position="popper">
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
