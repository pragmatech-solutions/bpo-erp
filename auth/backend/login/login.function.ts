import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import type { LoginCredentials, UserResponse } from './login.type';

export async function loginUser(credentials: LoginCredentials) {
	await connectToDatabase();

	const { email, password } = credentials;
	const user = await Users.findOne({ email });

	if (!user) {
		throw new Error('Invalid credentials');
	}

	if (user.status !== 'active') {
		throw new Error('Account is inactive. Please contact your admin.');
	}

	if (user.password !== password) {
		throw new Error('Invalid credentials');
	}

	const { _id, password: _password, ...rest } = user._doc;
	void _password;

	const userResponse: UserResponse = {
		id: _id.toString(),
		...rest,
	};

	return userResponse;
}
