import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';

export type LeadAnalytics = {
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
};

export type DashboardData = {
	analytics: LeadAnalytics;
	recentLeads: ListedLead[];
};
