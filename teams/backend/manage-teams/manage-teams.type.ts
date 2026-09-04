import type { UserRole } from '@/common/constants/user-roles.enum';
import type { UserAccountStatus } from '@/users/backend/manage-users/manage-users.type';

export type LeadStats = {
	total: number;
	pending: number;
	billable: number;
	nonBillable: number;
};

export type TeamLeaderOption = {
	id: string;
	name: string;
};

export type TeamLeadOption = TeamLeaderOption;

export type TeamOverviewItem = {
	id: string;
	name: string;
	teamLeads: TeamLeaderOption[];
	managers: TeamLeaderOption[];
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
	teamLeads: TeamLeaderOption[];
	managers: TeamLeaderOption[];
	total: number;
	page: number;
	limit: number;
};

export type TeamMemberPerformance = {
	id: string;
	name: string;
	email?: string;
	role: UserRole;
	status: UserAccountStatus;
	stats: LeadStats;
};

export type TeamPerformanceData = {
	id: string;
	name: string;
	teamLeads: TeamLeaderOption[];
	managers: TeamLeaderOption[];
	memberCount: number;
	agentCount: number;
	loanOfficerCount: number;
	stats: LeadStats;
	members: TeamMemberPerformance[];
};
