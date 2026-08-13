import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { SignupInput } from './signup.input-schema';
import { UserResponse } from '../login/login.type';

type MongoDuplicateKeyError = Error & {
	code?: number;
	keyPattern?: Record<string, number>;
	keyValue?: Record<string, unknown>;
};

function isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
	return (
		error instanceof Error &&
		'code' in error &&
		(error as MongoDuplicateKeyError).code === 11000
	);
}

function getDuplicateKeyMessage(error: MongoDuplicateKeyError) {
	if (error.keyPattern?.email) return 'User with this email already exists';
	if (error.keyPattern?.username) {
		const duplicateUsername = error.keyValue?.username;

		return duplicateUsername
			? `Username already exists: ${String(duplicateUsername)}`
			: 'Username already exists';
	}

	return 'User already exists';
}

export async function signupUser(input: SignupInput): Promise<UserResponse> {
	await connectToDatabase();

	const { name, username, email, password, role, phone_number } = input;
	const normalizedUsername = username.trim().toLowerCase();
	const normalizedEmail = email?.trim().toLowerCase();
	const normalizedPhoneNumber = phone_number?.trim() || undefined;

	const existingUser = await Users.findOne({
		$or: [
			{ username: normalizedUsername },
			...(normalizedEmail ? [{ email: normalizedEmail }] : []),
		],
	});
	if (existingUser) {
		throw new Error('User with this email or username already exists');
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	const now = new Date();

	try {
		await Users.collection.insertOne({
			name,
			username: normalizedUsername,
			email: normalizedEmail,
			password: hashedPassword,
			phone_number: normalizedPhoneNumber,
			role,
			status: 'inactive',
			availability_status: UserAvailabilityStatus.INACTIVE,
			created_at: now,
			updated_at: now,
		});

		return {
			name,
			username: normalizedUsername,
			email: normalizedEmail,
			phone_number: normalizedPhoneNumber,
			role,
			status: 'inactive',
			availability_status: UserAvailabilityStatus.INACTIVE,
		};
	} catch (error: unknown) {
		if (isDuplicateKeyError(error)) {
			throw new Error(getDuplicateKeyMessage(error));
		}

		throw error;
	}
}