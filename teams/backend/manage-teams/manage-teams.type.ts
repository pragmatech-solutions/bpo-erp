export type LeadStats = {
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
};

export type TeamOverviewItem = {
	id: string;
	name: string;
	teamLead: {
		id: string;
		name: string;
	} | null;
	memberCount: number;
	stats: LeadStats;
	status: string;
	createdAt: string;
};

export type TeamLeadOption = {
	id: string;
	name: string;
};

export type TeamOverviewData = {
	teams: TeamOverviewItem[];
	stats: LeadStats;
	teamLeads: TeamLeadOption[];
	total: number;
	page: number;
	limit: number;
};

export type TeamMemberPerformance = {
	id: string;
	name: string;
	email: string;
	stats: LeadStats;
};

export type TeamPerformanceData = {
	id: string;
	name: string;
	teamLead: {
		id: string;
		name: string;
	} | null;
	memberCount: number;
	stats: LeadStats;
	members: TeamMemberPerformance[];
};