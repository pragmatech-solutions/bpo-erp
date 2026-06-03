import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';

export type GetLeadInput = {
	id: string;
};

export type LeadDetails = {
	id: string;
	customerName: string;
	customerNumber: string;
	loanType: LoanType;
	status: LeadStatus;
	statusReason?: string;
	created_by: {
		id: string;
		name: string;
	};
	updatedAt: string;
};
