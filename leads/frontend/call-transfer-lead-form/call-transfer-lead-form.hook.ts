'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLoanOfficerOptionsApi } from '@/loan-officers/frontend/loan-officer-options';
import type { LoanOfficerOption } from '@/loan-officers/backend/list-loan-officers';
import type { CreateCallTransferLeadInput } from '@/leads/backend/create-call-transfer-lead/create-call-transfer-lead.input-schema';
import { createCallTransferLeadApi } from './call-transfer-lead.api';

type CallTransferError = string | Record<string, string[]>;
type FormValues = Omit<
	CreateCallTransferLeadInput,
	'home_value' | 'mortgage_balance' | 'mortgage_rate' | 'cash_out_amount'
> & {
	home_value: string;
	mortgage_balance: string;
	mortgage_rate: string;
	cash_out_amount: string;
};

const initialFormValues: FormValues = {
	first_name: '',
	last_name: '',
	origin_phone: '',
	address: '',
	city: '',
	state: '',
	zip: '',
	email: '',
	home_value: '',
	mortgage_balance: '',
	mortgage_rate_type: '',
	property_type: '',
	multiple_properties: 'No',
	mortgage_rate: '',
	cash_out_amount: '',
	loan_type: 'Conventional',
	loan_purpose: 'Cash Out',
	credit: 'Good',
	loan_officer_id: '',
};

function toNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

function formatError(error: CallTransferError) {
	if (typeof error === 'string') return error;

	return Object.values(error).flat().filter(Boolean).join(', ');
}

export function useCallTransferLeadFormHook() {
	const router = useRouter();
	const [values, setValues] = useState<FormValues>(initialFormValues);
	const [loanOfficerOptions, setLoanOfficerOptions] = useState<
		LoanOfficerOption[]
	>([]);
	const [error, setError] = useState<CallTransferError>('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function loadLoanOfficers() {
			const response = await getLoanOfficerOptionsApi();
			if (response.success && response.data) {
				setLoanOfficerOptions(response.data);
			}
		}

		loadLoanOfficers();
	}, []);

	const selectedLoanOfficer = useMemo(
		() =>
			loanOfficerOptions.find(
				(loanOfficer) => loanOfficer.id === values.loan_officer_id,
			),
		[loanOfficerOptions, values.loan_officer_id],
	);

	const existingLtv = useMemo(() => {
		const homeValue = Number(values.home_value);
		const loanBalance = Number(values.mortgage_balance);
		if (!homeValue || homeValue <= 0) return 0;

		return (loanBalance / homeValue) * 100;
	}, [values.home_value, values.mortgage_balance]);

	const cashOutLtv = useMemo(() => {
		const homeValue = Number(values.home_value);
		const loanBalance = Number(values.mortgage_balance);
		const cashOutAmount = Number(values.cash_out_amount);
		if (!homeValue || homeValue <= 0) return 0;

		return ((loanBalance + cashOutAmount) / homeValue) * 100;
	}, [values.cash_out_amount, values.home_value, values.mortgage_balance]);

	function updateField<Key extends keyof FormValues>(
		key: Key,
		value: FormValues[Key],
	) {
		setValues((current) => ({ ...current, [key]: value }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError('');
		setSuccess(false);
		setIsLoading(true);

		try {
			const payload: CreateCallTransferLeadInput = {
				...values,
				home_value: Number(values.home_value),
				mortgage_balance: Number(values.mortgage_balance),
				mortgage_rate: toNumber(values.mortgage_rate),
				cash_out_amount: toNumber(values.cash_out_amount),
			};
			const response = await createCallTransferLeadApi(payload);

			if (response.success) {
				setSuccess(true);
				setValues(initialFormValues);
			} else {
				setError(response.error || 'Failed to create call transfer lead');
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
		values,
		updateField,
		loanOfficerOptions,
		selectedLoanOfficer,
		existingLtv,
		cashOutLtv,
		errorMessage: formatError(error),
		success,
		isLoading,
		handleSubmit,
		handleCancel,
	};
}


