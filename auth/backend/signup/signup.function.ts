import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import { SignupInput } from './signup.input-schema';
import { UserResponse } from '../login/login.type';

export async function signupUser(input: SignupInput): Promise<UserResponse> {
	await connectToDatabase();

	const { name, username, email, password } = input;

	const existingUser = await Users.findOne({
		$or: [...(email ? [{ email }] : []), { username }],
	});
	if (existingUser) {
		throw new Error('User with this email or username already exists');
	}

	const hashedPassword = await bcrypt.hash(password, 12);

	const newUser = new Users({
		name,
		username,
		email,
		password: hashedPassword,
		role: 'agent',
		status: 'inactive',
	});

	await newUser.save();

	const { _id, password: _password, ...rest } = newUser._doc;
	void _id;
	void _password;

	return {
		...rest,
	};
}
