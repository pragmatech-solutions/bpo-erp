import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { requireAuthenticatedUser } from '@/common/backend/authorization.function';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import {
	updateAccountInputSchema,
	type UpdateAccountInput,
} from './account.input-schema';

type AccountDocument = {
	_id: Types.ObjectId;
	name: string;
	username: string;
	email?: string;
	phone_number?: string;
};

type AccountWithPasswordDocument = AccountDocument & {
	password: string;
};

function mapAccount(user: AccountDocument) {
	return {
		id: user._id.toString(),
		name: user.name,
		username: user.username,
		email: user.email || '',
		phoneNumber: user.phone_number || '',
	};
}

export async function getAccount() {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();

	const user = await Users.findById(currentUser.id)
		.select('_id name username email phone_number')
		.lean<AccountDocument>();

	if (!user) throw new Error('User not found');

	return mapAccount(user);
}

export async function updateAccount(input: UpdateAccountInput) {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	const validatedInput = updateAccountInputSchema.parse(input);

	const currentAccount = await Users.findById(currentUser.id)
		.select('_id name username email phone_number password')
		.lean<AccountWithPasswordDocument>();

	if (!currentAccount) throw new Error('User not found');

	const isCurrentPasswordValid = await bcrypt.compare(
		validatedInput.currentPassword,
		currentAccount.password,
	);

	if (!isCurrentPasswordValid) {
		throw new Error('Old password is incorrect');
	}

	if (validatedInput.email) {
		const existingEmailUser = await Users.findOne({
			email: validatedInput.email,
			_id: { $ne: new Types.ObjectId(currentUser.id) },
		})
			.select('_id')
			.lean();

		if (existingEmailUser) {
			throw new Error('User with this email already exists');
		}
	}

	const hashedPassword = await bcrypt.hash(validatedInput.newPassword, 12);

	const user = await Users.findByIdAndUpdate(
		currentUser.id,
		{
			name: validatedInput.name,
			email: validatedInput.email,
			phone_number: validatedInput.phoneNumber,
			password: hashedPassword,
		},
		{ new: true },
	)
		.select('_id name username email phone_number')
		.lean<AccountDocument>();

	if (!user) throw new Error('User not found');

	return mapAccount(user);
}
