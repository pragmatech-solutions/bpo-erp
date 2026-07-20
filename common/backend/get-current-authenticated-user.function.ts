import { Types } from 'mongoose';
import { getCurrentUser } from './get-current-user.function';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';

type CurrentUserDocument = {
	_id: Types.ObjectId;
	name: string;
	email?: string;
	role: UserRole;
	team_id?: Types.ObjectId | string | null;
};

export type CurrentAuthenticatedUser = {
	id: string;
	name: string;
	email?: string;
	role: UserRole;
	teamId?: string;
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
		.select('_id name email role team_id')
		.lean<CurrentUserDocument>();

	if (!user) {
		return null;
	}

	return {
		id: user._id.toString(),
		name: user.name,
		email: user.email,
		role: user.role,
		teamId: getOptionalObjectId(user.team_id),
	};
}
