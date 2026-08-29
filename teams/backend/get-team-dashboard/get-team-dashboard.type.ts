import type { UserRole } from '@/common/constants/user-roles.enum';
import type { LeadAnalytics } from '@/dashboard/backend/lead-analytics/lead-analytics.type';
import type { ListedLead } from '@/leads/backend/list-leads/list-leads.type';

export type TeamMemberDashboardItem = {
	id: string;
	name: string;
	email?: string;
	role: UserRole;
	status?: 'active' | 'inactive' | 'blocked';
	analytics: LeadAnalytics;
	campaigns: string[];
};

export type TeamDashboardData = {
	team: {
		id: string;
		name: string;
	};
	analytics: LeadAnalytics;
	members: TeamMemberDashboardItem[];
	campaigns: string[];
	leads: ListedLead[];
};
