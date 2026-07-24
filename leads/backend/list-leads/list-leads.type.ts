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
};

export type ListedLead = {
	id: string;
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
	campaign: string;
	created_by: {
		id: string;
		name: string;
	};
};
