import { Types } from 'mongoose';
import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { listLeadsInputSchema } from './list-leads.input-schema';
import type { ListedLead, ListLeadsInput } from './list-leads.type';

export async function listLeads(
	input: ListLeadsInput = {},
): Promise<ListedLead[]> {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();

	if (!currentUserId) throw new Error('Unauthorized');

	const currentUser = await Users.findById(currentUserId).lean();
	if (!currentUser) throw new Error('User not found');

	const validatedInput = listLeadsInputSchema.parse(input);
	const dateFilter: Record<string, Date> = {};

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;

	const matchStage: Record<string, unknown> = {};

	if (currentUser.role !== UserRole.ADMIN) {
		matchStage.created_by = new Types.ObjectId(currentUserId);
	} else if (
		validatedInput.agentId &&
		validatedInput.agentId !== 'All Agents'
	) {
		matchStage.created_by = new Types.ObjectId(validatedInput.agentId);
	}

	if (validatedInput.status) {
		matchStage.status = validatedInput.status;
	}

	if (validatedInput.paymentStatus) {
		matchStage.payment_status = validatedInput.paymentStatus;
	}

	if (validatedInput.campaign) {
		matchStage.campaign = validatedInput.campaign;
	}

	if (validatedInput.search) {
		const searchRegex = new RegExp(validatedInput.search, 'i');
		matchStage.$or = [
			{ customer_name: { $regex: searchRegex } },
			{ customer_number: { $regex: searchRegex } },
			{ username: { $regex: searchRegex } },
		];
	}

	if (Object.keys(dateFilter).length > 0) {
		matchStage.updated_at = dateFilter;
	}

	const leads = await Leads.aggregate([
		{ $match: matchStage },
		{ $sort: { updated_at: -1 } },
		{ $limit: validatedInput.limit },
		{
			$lookup: {
				from: 'users',
				localField: 'created_by',
				foreignField: '_id',
				as: 'created_by',
			},
		},
		{ $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				id: { $toString: '$_id' },
				customerName: '$customer_name',
				username: '$username',
				customerNumber: '$customer_number',
				loanType: '$loan_type',
				loanOfficerName: '$loan_officer_name',
				status: '$status',
				statusReason: '$status_reason',
				paymentStatus: '$payment_status',
				campaign: '$campaign',
				updatedAt: {
					$dateToString: {
						date: '$updated_at',
						format: '%Y-%m-%dT%H:%M:%S.%LZ',
					},
				},
				created_by: {
					id: { $ifNull: [{ $toString: '$created_by._id' }, ''] },
					name: { $ifNull: ['$created_by.name', 'Unknown'] },
				},
				_id: 0,
			},
		},
	]);

	return leads as ListedLead[];
}
