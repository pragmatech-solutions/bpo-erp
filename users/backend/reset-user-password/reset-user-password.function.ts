import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { requireAdmin } from '@/common/backend/authorization.function';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import {
	resetUserPasswordInputSchema,
	type ResetUserPasswordInput,
} from './reset-user-password.input-schema';

const passwordCharacters =
	'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';

function generateTemporaryPassword(length = 12) {
	let password = 'A1!';

	while (password.length < length) {
		const randomIndex = randomInt(passwordCharacters.length);
		password += passwordCharacters[randomIndex];
	}

	const passwordParts = password.split('');

	for (let index = passwordParts.length - 1; index > 0; index -= 1) {
		const randomIndex = randomInt(index + 1);
		[passwordParts[index], passwordParts[randomIndex]] = [
			passwordParts[randomIndex],
			passwordParts[index],
		];
	}

	return passwordParts.join('');
}

export async function resetUserPassword(input: ResetUserPasswordInput) {
	await connectToDatabase();
	await requireAdmin();

	const validatedInput = resetUserPasswordInputSchema.parse(input);

	if (!Types.ObjectId.isValid(validatedInput.id)) {
		throw new Error('User not found');
	}

	const temporaryPassword = generateTemporaryPassword();
	const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

	const user = await Users.findByIdAndUpdate(
		validatedInput.id,
		{ password: hashedPassword },
		{ new: true },
	)
		.select('_id name username email')
		.lean<{
			_id: Types.ObjectId;
			name: string;
			username: string;
			email?: string;
		}>();

	if (!user) throw new Error('User not found');

	return {
		user: {
			id: user._id.toString(),
			name: user.name,
			username: user.username,
			email: user.email,
		},
		temporaryPassword,
	};
}
