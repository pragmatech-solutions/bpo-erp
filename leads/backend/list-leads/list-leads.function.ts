import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { buildTeamLeadLeadMatch } from '@/common/backend/get-team-member-ids.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { listLeadsInputSchema } from './list-leads.input-schema';
import type { ListedLead, ListLeadsInput } from './list-leads.type';

export async function listLeads(
	input: ListLeadsInput = {},
): Promise<ListedLead[]> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const validatedInput = listLeadsInputSchema.parse(input);
	const dateFilter: Record<string, Date> = {};

	if (validatedInput.startDate) dateFilter.$gte = validatedInput.startDate;
	if (validatedInput.endDate) dateFilter.$lte = validatedInput.endDate;

	const matchStage: Record<string, unknown> = {};
	const isAdmin = currentUser.role === UserRole.ADMIN;

	if (isAdmin) {
		if (validatedInput.deletedFilter === 'active') {
			matchStage.deleted_at = { $exists: false };
		} else if (validatedInput.deletedFilter === 'deleted') {
			matchStage.deleted_at = { $exists: true };
		}
	} else {
		matchStage.deleted_at = { $exists: false };
	}

	if (isAdmin || currentUser.role === UserRole.QUALITY_ASSURANCE) {
		if (
			validatedInput.agentId &&
			validatedInput.agentId !== 'All Agents' &&
			Types.ObjectId.isValid(validatedInput.agentId)
		) {
			matchStage.created_by = new Types.ObjectId(validatedInput.agentId);
		}
	} else if (currentUser.role === UserRole.TEAM_LEAD) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team lead is not assigned to a team');
		}

		const requestedMemberId =
			validatedInput.agentId && validatedInput.agentId !== 'All Agents'
				? validatedInput.agentId
				: undefined;

		// Team scope can itself be an $or (agent-created OR loan-officer-assigned
		// leads), so it goes under $and to avoid clobbering the search $or below.
		matchStage.$and = [
			await buildTeamLeadLeadMatch(currentUser.teamId, requestedMemberId),
		];
	} else if (currentUser.role === UserRole.AGENT) {
		matchStage.created_by = new Types.ObjectId(currentUser.id);
	} else if (currentUser.role === UserRole.LOAN_OFFICER) {
		matchStage.loan_officer_id = new Types.ObjectId(currentUser.id);
	} else {
		throw new Error('Forbidden');
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
			$lookup: {
				from: 'users',
				localField: 'loan_officer_id',
				foreignField: '_id',
				as: 'loan_officer',
			},
		},
		{ $unwind: { path: '$loan_officer', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'deleted_by',
				foreignField: '_id',
				as: 'deleted_by',
			},
		},
		{ $unwind: { path: '$deleted_by', preserveNullAndEmptyArrays: true } },
		{
			$project: {
				id: { $toString: '$_id' },
				leadType: '$lead_type',
				customerName: '$customer_name',
				username: '$username',
				customerNumber: '$customer_number',
				loanType: '$loan_type',
				loanOfficerName: {
					$ifNull: ['$loan_officer.name', '$loan_officer_name'],
				},
				loanOfficerPhoneNumber: {
					$ifNull: ['$loan_officer.phone_number', '$loan_officer_phone_number'],
				},
				status: '$status',
				statusReason: '$status_reason',
				paymentStatus: '$payment_status',
				campaign: '$campaign',
				callTransfer: {
					firstName: '$call_transfer.first_name',
					lastName: '$call_transfer.last_name',
					originPhone: '$call_transfer.origin_phone',
					address: '$call_transfer.address',
					city: '$call_transfer.city',
					state: '$call_transfer.state',
					zip: '$call_transfer.zip',
					email: '$call_transfer.email',
					homeValue: '$call_transfer.home_value',
					mortgageBalance: '$call_transfer.mortgage_balance',
					mortgageRateType: '$call_transfer.mortgage_rate_type',
					propertyType: '$call_transfer.property_type',
					multipleProperties: '$call_transfer.multiple_properties',
					mortgageRate: '$call_transfer.mortgage_rate',
					cashOutAmount: '$call_transfer.cash_out_amount',
					loanType: '$call_transfer.loan_type',
					loanPurpose: '$call_transfer.loan_purpose',
					credit: '$call_transfer.credit',
				},
				deletedAt: {
					$cond: [
						{ $ifNull: ['$deleted_at', false] },
						{
							$dateToString: {
								date: '$deleted_at',
								format: '%Y-%m-%dT%H:%M:%S.%LZ',
							},
						},
						undefined,
					],
				},
				deletedBy: {
					$cond: [
						{ $ifNull: ['$deleted_by._id', false] },
						{
							id: { $toString: '$deleted_by._id' },
							name: { $ifNull: ['$deleted_by.name', 'Unknown'] },
						},
						undefined,
					],
				},
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
