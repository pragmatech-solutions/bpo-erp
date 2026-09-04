import { UserRole } from '@/common/constants/user-roles.enum';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';

export type UserAccountStatus = 'active' | 'inactive' | 'blocked';

export type ManagedUser = {
	id: string;
	name: string;
	username: string;
	email?: string;
	role: UserRole;
	status: UserAccountStatus;
	availabilityStatus: UserAvailabilityStatus;
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
