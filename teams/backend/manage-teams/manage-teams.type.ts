import type { UserRole } from '@/common/constants/user-roles.enum';

export type LeadStats = {
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
};

export type TeamLeadOption = {
	id: string;
	name: string;
};

export type TeamOverviewItem = {
	id: string;
	name: string;
	teamLeads: TeamLeadOption[];
	memberCount: number;
	agentCount: number;
	loanOfficerCount: number;
	stats: LeadStats;
	status: string;
	createdAt: string;
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
	email?: string;
	role: UserRole;
	stats: LeadStats;
};

export type TeamPerformanceData = {
	id: string;
	name: string;
	teamLeads: TeamLeadOption[];
	memberCount: number;
	agentCount: number;
	loanOfficerCount: number;
	stats: LeadStats;
	members: TeamMemberPerformance[];
};
