'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLeadApi } from './create-lead.api';

type CreateLeadError = string | Record<string, string[]>;

export function useCreateLeadFormHook() {
	const router = useRouter();
	const [customerName, setCustomerName] = useState('');
	const [customerNumber, setCustomerNumber] = useState('');
	const [campaign, setCampaign] = useState('');
	const [loanType, setLoanType] = useState('');
	const [loanOfficerName, setLoanOfficerName] = useState('');
	const [loanBalance, setLoanBalance] = useState('');
	const [homeValue, setHomeValue] = useState('');
	const [error, setError] = useState<CreateLeadError>('');
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const errorMessage = useMemo(() => {
		if (typeof error === 'string') {
			return error;
		}

		return Object.values(error).flat().filter(Boolean).join(', ');
	}, [error]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError('');
		setSuccess(false);
		setIsLoading(true);

		try {
			const response = await createLeadApi({
				customer_name: customerName,
				customer_number: customerNumber,
				campaign: campaign,
				loan_type: loanType,
				loan_balance: loanBalance ? Number(loanBalance) : undefined,
				home_value: homeValue ? Number(homeValue) : undefined,
				loan_officer_name: loanOfficerName || undefined,
			});

			if (response.success) {
				setSuccess(true);
				setCustomerName('');
				setCustomerNumber('');
				setCampaign('');
				setLoanType('');
				setLoanBalance('');
				setHomeValue('');
				setLoanOfficerName('');
			} else {
				setError(response.error || 'Failed to create lead');
			}
		} catch {
			setError('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	}

	function handleCancel() {
		router.back();
	}

	return {
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
	};
}
