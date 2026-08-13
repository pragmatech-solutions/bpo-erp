import { z } from 'zod';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import { requireAuthenticatedUser } from '@/common/backend/authorization.function';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';

export const updateUserAvailabilityInputSchema = z.object({
	availabilityStatus: z.nativeEnum(UserAvailabilityStatus),
});

export type UserAvailabilityResponse = {
	availabilityStatus: UserAvailabilityStatus;
};

export async function getCurrentUserAvailability(): Promise<UserAvailabilityResponse> {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();

	const user = await Users.findById(currentUser.id)
		.select('availability_status')
		.lean<{ availability_status?: UserAvailabilityStatus }>();

	if (!user) throw new Error('User not found');

	return {
		availabilityStatus:
			user.availability_status || UserAvailabilityStatus.INACTIVE,
	};
}

export async function updateCurrentUserAvailability(
	input: z.infer<typeof updateUserAvailabilityInputSchema>,
): Promise<UserAvailabilityResponse> {
	await connectToDatabase();
	const currentUser = await requireAuthenticatedUser();
	const validatedInput = updateUserAvailabilityInputSchema.parse(input);

	const updatedUser = await Users.findByIdAndUpdate(
		new Types.ObjectId(currentUser.id),
		{ availability_status: validatedInput.availabilityStatus },
		{ new: true },
	)
		.select('availability_status')
		.lean<{ availability_status?: UserAvailabilityStatus }>();

	if (!updatedUser) throw new Error('User not found');

	return {
		availabilityStatus:
			updatedUser.availability_status || UserAvailabilityStatus.INACTIVE,
	};
}