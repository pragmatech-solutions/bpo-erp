export type LeadAnalytics = {
	total: number;
	pending: number;
	billable: number;
	billablePaid: number;
	billableUnpaid: number;
	nonBillable: number;
};

export type DashboardData = {
	analytics: LeadAnalytics;
};
