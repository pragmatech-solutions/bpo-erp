import type { DisputeStatus } from '@/common/constants/dispute-status.enum';
import type { LeadStatus } from '@/common/constants/lead-status.enum';

type DisputeUser = {
	id: string;
	name: string;
};

export type ListedDispute = {
	id: string;
	status: DisputeStatus;
	decisionNotes?: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
	lead: {
		id: string;
		customerName: string;
		customerNumber: string;
		loanType: string;
		campaign: string;
		recordingLink?: string;
		updatedAt?: string;
		status?: LeadStatus;
	};
	agent: DisputeUser;
	loanOfficer: DisputeUser;
	createdBy: DisputeUser;
	updatedBy?: DisputeUser;
	deletedBy?: DisputeUser;
};

export type DisputeStats = {
	total: number;
	unresolved: number;
	resolved: number;
};

export type ListDisputesResult = {
	disputes: ListedDispute[];
	stats: DisputeStats;
	total: number;
	page: number;
	limit: number;
};