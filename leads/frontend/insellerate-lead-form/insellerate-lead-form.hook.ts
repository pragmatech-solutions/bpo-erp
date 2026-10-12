'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateInsellerateLeadInput } from '@/leads/backend/create-insellerate-lead/create-insellerate-lead.input-schema';
import { createInsellerateLeadApi } from './insellerate-lead.api';

export type InsellerateFormValues = {
	client_campaign: string;
	first_name: string;
	last_name: string;
	city: string;
	state: string;
	address: string;
	zip: string;
	email: string;
	mobile: string;
	mortgage_balance: string;
	loan_amount: string;
	interest_rate: string;
	credit_score: string;
	veteran: string;
	loan_type: string;
	employment_status: string;
};

const initialFormValues: InsellerateFormValues = {
	client_campaign: '',
	first_name: '',
	last_name: '',
	city: '',
	state: '',
	address: '',
	zip: '',
	email: '',
	mobile: '',
	mortgage_balance: '',
	loan_amount: '',
	interest_rate: '',
	credit_score: '',
	veteran: '',
	loan_type: '',
	employment_status: '',
};

const requiredFields: Array<[keyof InsellerateFormValues, string]> = [
	['client_campaign', 'Client'],
	['first_name', 'First name'],
	['last_name', 'Last name'],
	['city', 'City'],
	['state', 'State'],
	['zip', 'Zip code'],
	['mobile', 'Mobile phone'],
];

function toNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

function buildPayload(values: InsellerateFormValues) {
	return {
		...values,
		mortgage_balance: toNumber(values.mortgage_balance),
		loan_amount: toNumber(values.loan_amount),
		interest_rate: toNumber(values.interest_rate),
		credit_score: toNumber(values.credit_score),
	} as CreateInsellerateLeadInput;
}

export function useInsellerateLeadFormHook() {
	const router = useRouter();
	const [values, setValues] = useState(initialFormValues);
	const [errorMessage, setErrorMessage] = useState('');
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	function updateField<Key extends keyof InsellerateFormValues>(
		key: Key,
		value: string,
	) {
		const nextValue = key === 'state' ? value.toUpperCase() : value;
		setValues((current) => ({ ...current, [key]: nextValue }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorMessage('');
		setSuccess(false);

		const missing = requiredFields
			.filter(([key]) => !values[key].trim())
			.map(([, label]) => label);
		if (missing.length) {
			setErrorMessage(`Required: ${missing.join(', ')}`);
			return;
		}

		setIsLoading(true);
		try {
			const response = await createInsellerateLeadApi(buildPayload(values));

			if (response.success) {
				setSuccess(true);
				setValues(initialFormValues);
			} else {
				setErrorMessage(response.error || 'Failed to create insellerate lead');
			}
		} catch {
			setErrorMessage('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	}

	return {
		values,
		updateField,
		errorMessage,
		success,
		isLoading,
		handleSubmit,
		handleCancel: () => router.back(),
	};
}
