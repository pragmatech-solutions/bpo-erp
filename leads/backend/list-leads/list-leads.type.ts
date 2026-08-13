import { LeadStatus } from '@/common/constants/lead-status.enum';

export type ListLeadsInput = {
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	status?: LeadStatus;
	search?: string;
	campaign?: string;
	agentId?: string;
	paymentStatus?: 'paid' | 'unpaid';
	deletedFilter?: 'active' | 'deleted' | 'all';
};

export type ListedCallTransferLeadDetails = {
	firstName?: string;
	lastName?: string;
	originPhone?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	email?: string;
	homeValue?: number;
	mortgageBalance?: number;
	mortgageRateType?: string;
	propertyType?: string;
	multipleProperties?: string;
	mortgageRate?: number;
	cashOutAmount?: number;
	loanType?: string;
	loanPurpose?: string;
	credit?: string;
};

export type ListedLead = {
	id: string;
	leadType?: 'standard' | 'call_transfer';
	customerName: string;
	username?: string;
	customerNumber: string;
	loanType: string;
	loanOfficerName?: string;
	loanOfficerPhoneNumber?: string;
	status: LeadStatus;
	statusReason?: string;
	paymentStatus?: 'paid' | 'unpaid';
	updatedAt: string;
	deletedAt?: string;
	deletedBy?: {
		id: string;
		name: string;
	};
	campaign: string;
	callTransfer?: ListedCallTransferLeadDetails;
	created_by: {
		id: string;
		name: string;
	};
};
