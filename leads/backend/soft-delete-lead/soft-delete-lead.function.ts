import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';

export type SoftDeleteLeadInput = {
	id: string;
};

export type SoftDeleteLeadResponse = {
	success: boolean;
	message?: string;
	error?: string;
};

export async function softDeleteLead(
	input: SoftDeleteLeadInput,
): Promise<SoftDeleteLeadResponse> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden: Only admins can soft delete leads');
	}

	if (!Types.ObjectId.isValid(input.id)) {
		throw new Error('Lead not found');
	}

	const deletedLead = await Leads.findOneAndUpdate(
		{
			_id: input.id,
			deleted_at: { $exists: false },
		},
		{
			$set: {
				deleted_at: new Date(),
				deleted_by: new Types.ObjectId(currentUser.id),
			},
		},
		{ new: true },
	).select('_id');

	if (!deletedLead) {
		throw new Error('Lead not found');
	}

	return { success: true, message: 'Lead soft deleted successfully' };
}
