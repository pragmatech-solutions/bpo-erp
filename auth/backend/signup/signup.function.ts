import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
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

	const { name, email, password, role, phone_number } = input;
	const normalizedEmail = email.trim().toLowerCase();
	const username = normalizedEmail;

	const existingUser = await Users.findOne({
		$or: [{ email: normalizedEmail }, { username }],
	});
	if (existingUser) {
		throw new Error('User with this email already exists');
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	const now = new Date();

	try {
		await Users.collection.insertOne({
			name,
			email: normalizedEmail,
			username,
			password: hashedPassword,
			phone_number: phone_number?.trim() || undefined,
			role,
			status: 'inactive',
			created_at: now,
			updated_at: now,
		});

		return {
			name,
			email: normalizedEmail,
			phone_number: phone_number?.trim() || undefined,
			role,
			status: 'inactive',
		};
	} catch (error: unknown) {
		if (isDuplicateKeyError(error)) {
			throw new Error(getDuplicateKeyMessage(error));
		}

		throw error;
	}
}
