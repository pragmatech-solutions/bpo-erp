import type { UserRole } from '@/common/constants/user-roles.enum';

export type AgentListItem = {
	id: string;
	name: string;
	role: UserRole;
};
