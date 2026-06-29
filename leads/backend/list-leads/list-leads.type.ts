import { LeadStatus } from '@/common/constants/lead-status.enum';

export type ListLeadsInput = {
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	status?: LeadStatus;
	search?: string;
	campaign?: string;
};

export type ListedLead = {
	id: string;
	customerName: string;
	customerNumber: string;
	loanType: string;
	status: LeadStatus;
	statusReason?: string;
	updatedAt: string;
	campaign: string;
	created_by: {
		id: string;
		name: string;
	};
};
