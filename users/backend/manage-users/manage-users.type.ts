import { UserRole } from '@/common/constants/user-roles.enum';

export type UserAccountStatus = 'active' | 'inactive' | 'blocked';

export type ManagedUser = {
	id: string;
	name: string;
	username: string;
	email?: string;
	role: UserRole;
	status: UserAccountStatus;
	team: {
		id: string;
		name: string;
	} | null;
	createdBy: string;
	createdAt: string;
};

export type ManagedUserListData = {
	users: ManagedUser[];
	total: number;
	page: number;
	limit: number;
};
