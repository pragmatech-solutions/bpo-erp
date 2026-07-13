'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLeadApi } from './get-lead.api';
import { updateLeadApi } from './update-lead.api';
import { LeadStatus } from '@/common/constants/lead-status.enum';

function formatErrorMessage(error: string): string {
	try {
		const parsed: unknown = JSON.parse(error);
		if (Array.isArray(parsed)) {
			const messages = parsed
				.map((issue) => {
					if (
						typeof issue === 'object' &&
						issue !== null &&
						'message' in issue &&
						typeof issue.message === 'string'
					) {
						return issue.message;
					}

					return '';
				})
				.filter(Boolean);

			return messages.join(', ');
		}
		return error;
	} catch {
		return error;
	}
}

export function useUpdateLeadFormHook(id: string) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const [customerName, setCustomerName] = useState('');
	const [username, setUsername] = useState('');
	const [customerNumber, setCustomerNumber] = useState('');
	const [loanType, setLoanType] = useState('');
	const [status, setStatus] = useState<LeadStatus>(LeadStatus.PENDING);
	const [statusReason, setStatusReason] = useState('');
	const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(
		'unpaid',
	);

	const fetchLead = useCallback(async () => {
		setIsLoading(true);
		const response = await getLeadApi(id);

		if (response.success && response.data) {
			const { data } = response;
			setCustomerName(data.customerName);
			setUsername(data.username);
			setCustomerNumber(data.customerNumber);
			setLoanType(data.loanType);
			setStatus(data.status);
			setStatusReason(data.statusReason || '');
			setPaymentStatus(data.paymentStatus || 'unpaid');
		} else {
			setErrorMessage(
				formatErrorMessage(response.error || 'Failed to fetch lead'),
			);
		}
		setIsLoading(false);
	}, [id]);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchLead();
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [fetchLead]);

	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setErrorMessage('');
		setSuccessMessage('');
		setIsSubmitting(true);

		const response = await updateLeadApi({
			id,
			status,
			statusReason:
				status === LeadStatus.NON_BILLABLE ? statusReason : undefined,
			paymentStatus,
		});

		if (response.success) {
			setSuccessMessage(response.message || 'Lead updated successfully');
			setTimeout(() => router.push('/leads/list'), 1500);
		} else {
			setErrorMessage(
				formatErrorMessage(response.error || 'Failed to update lead'),
			);
		}
		setIsSubmitting(false);
	};

	const handleCancel = () => {
		router.back();
	};

	return {
		isLoading,
		isSubmitting,
		errorMessage,
		successMessage,
		form: {
			customerName,
			username,
			customerNumber,
			loanType,
			status,
			setStatus,
			statusReason,
			setStatusReason,
			paymentStatus,
			setPaymentStatus,
		},
		handleSubmit,
		handleCancel,
	};
}


