import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';

export type GetLeadInput = {
	id: string;
};

export type LeadDetails = {
	id: string;
	customerName: string;
	username: string;
	customerNumber: string;
	loanType: LoanType;
	loanOfficerName?: string;
	loanOfficerPhoneNumber?: string;
	status: LeadStatus;
	statusReason?: string;
	paymentStatus?: 'paid' | 'unpaid';
	created_by: {
		id: string;
		name: string;
	};
	updatedAt: string;
};
