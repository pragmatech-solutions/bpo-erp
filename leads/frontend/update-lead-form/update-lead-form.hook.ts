'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaignOptionsApi } from '@/campaigns/frontend/campaign-options';
import { CAMPAIGNS } from '@/common/constants/campaigns';
import {
	CALL_TRANSFER_CREDIT_RATINGS,
	CALL_TRANSFER_LOAN_PURPOSES,
	CALL_TRANSFER_LOAN_TYPES,
} from '@/common/constants/call-transfer-lead-options';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { getCurrentLoggedInUserInformation } from '@/auth/frontend/login-form/get-current-logged-in-user-information.function';
import { getLoanOfficerOptionsApi } from '@/loan-officers/frontend/loan-officer-options';
import type { LoanOfficerOption } from '@/loan-officers/backend/list-loan-officers';
import { getLeadApi } from './get-lead.api';
import { updateLeadApi } from './update-lead.api';

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

type CallTransferFormValues = {
	firstName: string;
	lastName: string;
	originPhone: string;
	address: string;
	city: string;
	state: string;
	zip: string;
	email: string;
	homeValue: string;
	mortgageBalance: string;
	mortgageRateType: string;
	propertyType: string;
	multipleProperties: 'Yes' | 'No';
	mortgageRate: string;
	cashOutAmount: string;
	loanType: (typeof CALL_TRANSFER_LOAN_TYPES)[number];
	loanPurpose: (typeof CALL_TRANSFER_LOAN_PURPOSES)[number];
	credit: (typeof CALL_TRANSFER_CREDIT_RATINGS)[number];
};

const initialCallTransferValues: CallTransferFormValues = {
	firstName: '',
	lastName: '',
	originPhone: '',
	address: '',
	city: '',
	state: '',
	zip: '',
	email: '',
	homeValue: '',
	mortgageBalance: '',
	mortgageRateType: '',
	propertyType: '',
	multipleProperties: 'No',
	mortgageRate: '',
	cashOutAmount: '',
	loanType: 'Conventional',
	loanPurpose: 'Cash Out',
	credit: 'Good',
};

function toOptionalNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

export function useUpdateLeadFormHook(id: string) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const [leadType, setLeadType] = useState<'standard' | 'call_transfer'>(
		'standard',
	);
	const [customerName, setCustomerName] = useState('');
	const [username, setUsername] = useState('');
	const [customerNumber, setCustomerNumber] = useState('');
	const [campaign, setCampaign] = useState('');
	const [loanTypeValue, setLoanTypeValue] = useState<LoanType>(
		LoanType.CONVENTIONAL,
	);
	const [loanBalance, setLoanBalance] = useState('');
	const [homeValue, setHomeValue] = useState('');
	const [loanOfficerId, setLoanOfficerId] = useState('');
	const [loanOfficerName, setLoanOfficerName] = useState('');
	const [loanOfficerPhoneNumber, setLoanOfficerPhoneNumber] = useState('');
	const [callTransfer, setCallTransfer] = useState<CallTransferFormValues>(
		initialCallTransferValues,
	);
	const [status, setStatus] = useState<LeadStatus>(LeadStatus.PENDING);
	const [statusReason, setStatusReason] = useState('');
	const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(
		'unpaid',
	);
	const [campaignOptions, setCampaignOptions] = useState<string[]>(CAMPAIGNS);
	const [loanOfficerOptions, setLoanOfficerOptions] = useState<
		LoanOfficerOption[]
	>([]);
	const [currentRole] = useState(() => {
		const userInfo = getCurrentLoggedInUserInformation();
		return userInfo?.currentUser.role as UserRole | undefined;
	});
	const isAdmin = currentRole === UserRole.ADMIN;
	const isManager = currentRole === UserRole.MANAGER;
	const isQualityAssurance = currentRole === UserRole.QUALITY_ASSURANCE;
	const isLoanOfficer = currentRole === UserRole.LOAN_OFFICER;

	const selectedLoanOfficer = useMemo(
		() =>
			loanOfficerOptions.find(
				(loanOfficer) => loanOfficer.id === loanOfficerId,
			),
		[loanOfficerOptions, loanOfficerId],
	);

	function updateCallTransferField<Key extends keyof CallTransferFormValues>(
		key: Key,
		value: CallTransferFormValues[Key],
	) {
		setCallTransfer((current) => ({ ...current, [key]: value }));
	}

	const fetchLead = useCallback(async () => {
		setIsLoading(true);
		const response = await getLeadApi(id);

		if (response.success && response.data) {
			const { data } = response;
			setLeadType(data.leadType || 'standard');
			setCustomerName(data.customerName);
			setUsername(data.username);
			setCustomerNumber(data.customerNumber);
			setCampaign(data.campaign);
			setLoanTypeValue(data.loanType);
			setLoanBalance(data.loanBalance?.toString() || '');
			setHomeValue(data.homeValue?.toString() || '');
			setLoanOfficerId(data.loanOfficerId || '');
			setLoanOfficerName(data.loanOfficerName || '');
			setLoanOfficerPhoneNumber(data.loanOfficerPhoneNumber || '');
			setStatus(data.status);
			setStatusReason(data.statusReason || '');
			setPaymentStatus(data.paymentStatus || 'unpaid');

			if (data.callTransfer) {
				setCallTransfer({
					firstName: data.callTransfer.firstName || '',
					lastName: data.callTransfer.lastName || '',
					originPhone: data.callTransfer.originPhone || '',
					address: data.callTransfer.address || '',
					city: data.callTransfer.city || '',
					state: data.callTransfer.state || '',
					zip: data.callTransfer.zip || '',
					email: data.callTransfer.email || '',
					homeValue: data.callTransfer.homeValue?.toString() || '',
					mortgageBalance: data.callTransfer.mortgageBalance?.toString() || '',
					mortgageRateType: data.callTransfer.mortgageRateType || '',
					propertyType: data.callTransfer.propertyType || '',
					multipleProperties:
						data.callTransfer.multipleProperties === 'Yes' ? 'Yes' : 'No',
					mortgageRate: data.callTransfer.mortgageRate?.toString() || '',
					cashOutAmount: data.callTransfer.cashOutAmount?.toString() || '',
					loanType:
						CALL_TRANSFER_LOAN_TYPES.find(
							(type) => type === data.callTransfer?.loanType,
						) || 'Conventional',
					loanPurpose:
						CALL_TRANSFER_LOAN_PURPOSES.find(
							(purpose) => purpose === data.callTransfer?.loanPurpose,
						) || 'Cash Out',
					credit:
						CALL_TRANSFER_CREDIT_RATINGS.find(
							(credit) => credit === data.callTransfer?.credit,
						) || 'Good',
				});
			}
		} else {
			setErrorMessage(
				formatErrorMessage(response.error || 'Failed to fetch lead'),
			);
		}
		setIsLoading(false);
	}, [id]);

	useEffect(() => {
		async function loadOptions() {
			if (!isAdmin) return;

			const [campaignResponse, loanOfficerResponse] = await Promise.all([
				getCampaignOptionsApi(),
				getLoanOfficerOptionsApi(),
			]);

			if (campaignResponse.campaigns.length > 0) {
				setCampaignOptions(campaignResponse.campaigns);
			}

			if (loanOfficerResponse.success && loanOfficerResponse.data) {
				setLoanOfficerOptions(loanOfficerResponse.data);
			}
		}

		loadOptions();
	}, [isAdmin]);

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

		const payload = {
			id,
			status,
			statusReason:
				status === LeadStatus.NON_BILLABLE ? statusReason : undefined,
			...(isAdmin || isManager ? { paymentStatus } : {}),
			...(isAdmin
				? {
						paymentStatus,
						customerName,
						username,
						customerNumber,
						campaign,
						loanType: loanTypeValue,
						loanBalance: toOptionalNumber(loanBalance),
						homeValue: toOptionalNumber(homeValue),
						loanOfficerId,
						...(leadType === 'call_transfer'
							? {
									callTransfer: {
										...callTransfer,
										homeValue: toOptionalNumber(callTransfer.homeValue),
										mortgageBalance: toOptionalNumber(
											callTransfer.mortgageBalance,
										),
										mortgageRate: toOptionalNumber(callTransfer.mortgageRate),
										cashOutAmount: toOptionalNumber(callTransfer.cashOutAmount),
									},
								}
							: {}),
					}
				: {}),
		};

		const response = await updateLeadApi(payload);

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
			leadType,
			customerName,
			setCustomerName,
			username,
			setUsername,
			customerNumber,
			setCustomerNumber,
			campaign,
			setCampaign,
			loanType: loanTypeValue,
			setLoanType: setLoanTypeValue,
			loanBalance,
			setLoanBalance,
			homeValue,
			setHomeValue,
			loanOfficerId,
			setLoanOfficerId,
			loanOfficerName: selectedLoanOfficer?.name || loanOfficerName,
			loanOfficerPhoneNumber:
				selectedLoanOfficer?.phoneNumber || loanOfficerPhoneNumber,
			callTransfer,
			updateCallTransferField,
			campaignOptions,
			loanOfficerOptions,
			status,
			setStatus,
			statusReason,
			setStatusReason,
			paymentStatus,
			setPaymentStatus,
			isAdmin,
			isManager,
			isQualityAssurance,
			isLoanOfficer,
		},
		handleSubmit,
		handleCancel,
	};
}
