import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import type { ListedCallTransferLeadDetails } from '@/leads/backend/list-leads/list-leads.type';

export type GetLeadInput = {
	id: string;
};

export type LeadDetails = {
	id: string;
	leadType?: 'standard' | 'call_transfer';
	customerName: string;
	username: string;
	customerNumber: string;
	campaign: string;
	loanType: LoanType;
	loanBalance?: number;
	homeValue?: number;
	loanOfficerId?: string;
	loanOfficerName?: string;
	loanOfficerPhoneNumber?: string;
	callTransfer?: ListedCallTransferLeadDetails;
	status: LeadStatus;
	statusReason?: string;
	paymentStatus?: 'paid' | 'unpaid';
	created_by: {
		id: string;
		name: string;
	};
	updatedAt: string;
};
