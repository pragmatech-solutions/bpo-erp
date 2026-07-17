import { Types } from 'mongoose';
import {
	getCurrentAuthenticatedUser,
	type CurrentAuthenticatedUser,
} from './get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';

export async function requireAuthenticatedUser() {
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) {
		throw new Error('Unauthorized');
	}

	return currentUser;
}

export async function requireAdmin() {
	const currentUser = await requireAuthenticatedUser();

	if (currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden: Admin access only');
	}

	return currentUser;
}

export function getErrorStatus(message: string) {
	if (message === 'Unauthorized') return 401;
	if (message.includes('Forbidden')) return 403;
	if (message.includes('not found')) return 404;
	if (message.includes('already')) return 409;
	return 400;
}

export function isSameTeam(
	currentUser: CurrentAuthenticatedUser,
	targetTeamId?: Types.ObjectId | string | null,
) {
	return Boolean(
		currentUser.teamId &&
			targetTeamId &&
			currentUser.teamId === targetTeamId.toString(),
	);
}
