import { Types } from 'mongoose';
import { requireAuthenticatedUser } from '@/common/backend/authorization.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Teams } from '@/common/models/teams.schema';
import { Users } from '@/common/models/users.schema';
import {
	listUsersInputSchema,
	updateUserInputSchema,
	type ListUsersInput,
	type UpdateUserInput,
} from './manage-users.input-schema';
import type { ManagedUser, ManagedUserListData } from './manage-users.type';

type UserDocument = {
	_id: Types.ObjectId;
	name: string;
	username: string;
	email?: string;
	role: UserRole;
	status: 'active' | 'inactive' | 'blocked';
	team_id?: { _id: Types.ObjectId; name: string } | null;
	created_by?: { name?: string } | null;
	created_at: Date;
};

function mapUser(user: UserDocument): ManagedUser {
	return {
		id: user._id.toString(),
		name: user.name,
		username: user.username,
		email: user.email,
		role: user.role,
		status: user.status,
		team: user.team_id
			? { id: user.team_id._id.toString(), name: user.team_id.name }
			: null,
		createdBy: user.created_by?.name || 'Unknown',
		createdAt: user.created_at.toISOString(),
	};
}

function getScopedUserFilter(
	role: UserRole,
	teamId?: string,
): Record<string, unknown> {
	if (role === UserRole.ADMIN) return {};
	if (role === UserRole.TEAM_LEAD && teamId) {
		return {
			role: UserRole.AGENT,
			team_id: new Types.ObjectId(teamId),
		};
	}

	throw new Error('Forbidden: User management access denied');
}

export async function listManagedUsers(
	input: ListUsersInput = {},
): Promise<ManagedUserListData> {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	const validatedInput = listUsersInputSchema.parse(input);
	const filter = getScopedUserFilter(currentUser.role, currentUser.teamId);

	if (currentUser.role === UserRole.ADMIN) {
		if (validatedInput.role !== 'all') filter.role = validatedInput.role;
		if (validatedInput.teamId) {
			filter.team_id = new Types.ObjectId(validatedInput.teamId);
		}
		if (validatedInput.withoutTeam) filter.team_id = null;
		if (validatedInput.createdBy) {
			filter.created_by = new Types.ObjectId(validatedInput.createdBy);
		}
	}

	if (validatedInput.status !== 'all') filter.status = validatedInput.status;
	if (validatedInput.search) {
		const searchRegex = new RegExp(validatedInput.search, 'i');
		filter.$or = [
			{ name: searchRegex },
			{ email: searchRegex },
			{ username: searchRegex },
		];
	}

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const [users, total] = await Promise.all([
		Users.find(filter)
			.select(
				'_id name username email role status team_id created_by created_at',
			)
			.populate('team_id', 'name')
			.populate('created_by', 'name')
			.sort({ created_at: -1 })
			.skip(skip)
			.limit(validatedInput.limit)
			.lean<UserDocument[]>(),
		Users.countDocuments(filter),
	]);

	return {
		users: users.map(mapUser),
		total,
		page: validatedInput.page,
		limit: validatedInput.limit,
	};
}

async function getAdminUpdatePayload(input: UpdateUserInput) {
	const updatePayload: Record<string, unknown> = {};

	if (input.role !== undefined) updatePayload.role = input.role;
	if (input.status !== undefined) updatePayload.status = input.status;

	if (input.teamId !== undefined) {
		if (input.teamId === null || input.teamId === '') {
			updatePayload.team_id = null;
		} else {
			if (!Types.ObjectId.isValid(input.teamId))
				throw new Error('Team not found');
			const teamExists = await Teams.exists({ _id: input.teamId });
			if (!teamExists) throw new Error('Team not found');
			updatePayload.team_id = new Types.ObjectId(input.teamId);
		}
	}

	return updatePayload;
}
export async function updateManagedUser(input: UpdateUserInput) {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	const validatedInput = updateUserInputSchema.parse(input);

	if (!Types.ObjectId.isValid(validatedInput.id)) {
		throw new Error('User not found');
	}

	const targetUser = await Users.findById(validatedInput.id).lean<{
		_id: Types.ObjectId;
		role: UserRole;
		team_id?: Types.ObjectId | null;
	}>();
	if (!targetUser) throw new Error('User not found');

	let updatePayload: Record<string, unknown>;

	if (currentUser.role === UserRole.ADMIN) {
		updatePayload = await getAdminUpdatePayload(validatedInput);
	} else if (currentUser.role === UserRole.TEAM_LEAD) {
		if (
			validatedInput.role !== undefined ||
			validatedInput.teamId !== undefined
		) {
			throw new Error('Forbidden: Team leads can only update account status');
		}
		if (
			validatedInput.status !== 'active' &&
			validatedInput.status !== 'inactive'
		) {
			throw new Error(
				'Forbidden: User account status can only be active or inactive',
			);
		}
		if (
			targetUser.role !== UserRole.AGENT ||
			!currentUser.teamId ||
			targetUser.team_id?.toString() !== currentUser.teamId
		) {
			throw new Error('User not found');
		}
		updatePayload = { status: validatedInput.status };
	} else {
		throw new Error('Forbidden: User management access denied');
	}

	if (Object.keys(updatePayload).length === 0) {
		throw new Error('No user fields provided for update');
	}

	const user = await Users.findByIdAndUpdate(validatedInput.id, updatePayload, {
		new: true,
	})
		.select('_id name username email role status team_id created_by created_at')
		.populate('team_id', 'name')
		.populate('created_by', 'name')
		.lean<UserDocument>();

	if (!user) throw new Error('User not found');

	return mapUser(user);
}
