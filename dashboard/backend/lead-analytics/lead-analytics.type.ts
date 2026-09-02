export type LeadAnalytics = {
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
};

export type DashboardData = {
	analytics: LeadAnalytics;
};