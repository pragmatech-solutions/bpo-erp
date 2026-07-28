'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLeadApi } from './create-lead.api';
import { getCampaignOptionsApi } from '@/campaigns/frontend/campaign-options';
import { CAMPAIGNS } from '@/common/constants/campaigns';

type CreateLeadError = string | Record<string, string[]>;

export function useCreateLeadFormHook() {
	const router = useRouter();
	const [customerName, setCustomerName] = useState('');
	const [username, setUsername] = useState('');
	const [customerNumber, setCustomerNumber] = useState('');
	const [campaign, setCampaign] = useState('');
	const [loanType, setLoanType] = useState('');
	const [loanBalance, setLoanBalance] = useState('');
	const [homeValue, setHomeValue] = useState('');
	const [error, setError] = useState<CreateLeadError>('');
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);

	useEffect(() => {
		async function loadCampaignOptions() {
			try {
				const response = await getCampaignOptionsApi();
				if (response.campaigns.length > 0) {
					setCampaignOptions(response.campaigns);
				}
			} catch {
				setCampaignOptions(CAMPAIGNS);
			}
		}

		loadCampaignOptions();
	}, []);

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
				username,
				customer_number: customerNumber,
				campaign,
				loan_type: loanType,
				loan_balance: loanBalance ? Number(loanBalance) : undefined,
				home_value: homeValue ? Number(homeValue) : undefined,
			});

			if (response.success) {
				setSuccess(true);
				setCustomerName('');
				setUsername('');
				setCustomerNumber('');
				setCampaign('');
				setLoanType('');
				setLoanBalance('');
				setHomeValue('');
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
		username,
		setUsername,
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
		campaignOptions,
		errorMessage,
		isLoading,
		success,
		handleSubmit,
		handleCancel,
	};
}
