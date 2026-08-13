import { Types } from 'mongoose';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { getCurrentUser } from './get-current-user.function';

type CurrentUserDocument = {
	_id: Types.ObjectId;
	name: string;
	email?: string;
	role: UserRole;
	status?: string;
	team_id?: Types.ObjectId | string | null;
	availability_status?: UserAvailabilityStatus;
};

export type CurrentAuthenticatedUser = {
	id: string;
	name: string;
	email?: string;
	role: UserRole;
	teamId?: string;
	availabilityStatus: UserAvailabilityStatus;
};

function getOptionalObjectId(value?: Types.ObjectId | string | null) {
	if (!value) {
		return undefined;
	}

	return value.toString();
}

export async function getCurrentAuthenticatedUser(): Promise<CurrentAuthenticatedUser | null> {
	const currentUserId = await getCurrentUser();

	if (!currentUserId) {
		return null;
	}

	const user = await Users.findById(currentUserId)
		.select('_id name email role status team_id availability_status')
		.lean<CurrentUserDocument>();

	if (!user || user.status !== 'active') {
		return null;
	}

	return {
		id: user._id.toString(),
		name: user.name,
		email: user.email,
		role: user.role,
		teamId: getOptionalObjectId(user.team_id),
		availabilityStatus: user.availability_status || UserAvailabilityStatus.INACTIVE,
	};
}
