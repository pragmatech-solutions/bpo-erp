import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import type { LoginCredentials, UserResponse } from './login.type';
import { createAccessToken, createRefreshToken } from './create-session.function';

export async function loginUser(credentials: LoginCredentials) {
	await connectToDatabase();

	const { identifier, password } = credentials;
	const user = await Users.findOne({
		$or: [{ email: identifier }, { username: identifier }],
	});

	if (!user) {
		throw new Error('Invalid credentials');
	}

	if (user.status !== 'active') {
		throw new Error(`Account is ${user.status}. Please contact your admin.`);
	}

	const isPasswordMatch = await bcrypt.compare(password, user.password);

	if (!isPasswordMatch) {
		throw new Error('Invalid credentials');
	}

	const { _id, password: _password, ...rest } = user._doc;
	void _password;

	const token = await createAccessToken(_id.toString());
	const refreshToken = await createRefreshToken(_id.toString());

	const userResponse: UserResponse = {
		...rest,
		token,
		refreshToken,
	};

	return userResponse;
}
