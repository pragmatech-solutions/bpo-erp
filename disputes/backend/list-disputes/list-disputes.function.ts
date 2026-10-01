import { Types, type PipelineStage } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Disputes } from '@/common/models/disputes.schema';
import {
	listDisputesInputSchema,
	type ListDisputesInput,
} from './list-disputes.input-schema';
import type { ListedDispute, ListDisputesResult } from './list-disputes.type';

function getScopedMatchStages(currentUser: {
	id: string;
	role: UserRole;
	teamId?: string;
}): PipelineStage[] {
	if (
		currentUser.role === UserRole.ADMIN ||
		currentUser.role === UserRole.QUALITY_ASSURANCE
	) {
		return [];
	}

	if (
		currentUser.role === UserRole.MANAGER ||
		currentUser.role === UserRole.TEAM_LEAD
	) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team-scoped user is not assigned to a team');
		}

		const teamObjectId = new Types.ObjectId(currentUser.teamId);
		return [
			{
				$match: {
					$or: [
						{ 'agent.team_id': teamObjectId },
						{ 'loan_officer.team_id': teamObjectId },
					],
				},
			},
		];
	}

	if (currentUser.role === UserRole.AGENT) {
		return [
			{ $match: { 'lead.created_by': new Types.ObjectId(currentUser.id) } },
		];
	}

	if (currentUser.role === UserRole.LOAN_OFFICER) {
		return [
			{
				$match: { 'lead.loan_officer_id': new Types.ObjectId(currentUser.id) },
			},
		];
	}

	throw new Error('Forbidden');
}

function getDateMatch(startDate?: Date, endDate?: Date) {
	const dateFilter: Record<string, Date> = {};
	if (startDate) dateFilter.$gte = startDate;
	if (endDate) dateFilter.$lte = endDate;
	return Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : {};
}

function createLeadVisibilityStages(currentUser: {
	role: UserRole;
}): PipelineStage[] {
	const stages: PipelineStage[] = [
		{ $match: { 'lead._id': { $exists: true } } },
	];
	if (currentUser.role !== UserRole.ADMIN) {
		stages.push({ $match: { 'lead.deleted_at': { $exists: false } } });
	}

	return stages;
}

function createLookupStages(): PipelineStage[] {
	return [
		{
			$lookup: {
				from: 'leads',
				localField: 'lead_id',
				foreignField: '_id',
				as: 'lead',
			},
		},
		{ $unwind: { path: '$lead', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'lead.created_by',
				foreignField: '_id',
				as: 'agent',
			},
		},
		{ $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'lead.loan_officer_id',
				foreignField: '_id',
				as: 'loan_officer',
			},
		},
		{ $unwind: { path: '$loan_officer', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'created_by',
				foreignField: '_id',
				as: 'created_by_user',
			},
		},
		{ $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'updated_by',
				foreignField: '_id',
				as: 'updated_by_user',
			},
		},
		{ $unwind: { path: '$updated_by_user', preserveNullAndEmptyArrays: true } },
		{
			$lookup: {
				from: 'users',
				localField: 'deleted_by',
				foreignField: '_id',
				as: 'deleted_by_user',
			},
		},
		{ $unwind: { path: '$deleted_by_user', preserveNullAndEmptyArrays: true } },
	];
}

function escapeRegex(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createSearchMatch(search?: string): PipelineStage[] {
	const trimmedSearch = search?.trim();
	if (!trimmedSearch) return [];
	const searchRegex = new RegExp(escapeRegex(trimmedSearch), 'i');
	return [
		{
			$match: {
				$or: [
					{ 'lead.customer_name': { $regex: searchRegex } },
					{ 'lead.customer_number': { $regex: searchRegex } },
					{ 'agent.name': { $regex: searchRegex } },
					{ 'loan_officer.name': { $regex: searchRegex } },
				],
			},
		},
	];
}

function createCreatedByFilterMatch(createdById?: string): PipelineStage[] {
	if (!createdById || !Types.ObjectId.isValid(createdById)) return [];
	return [{ $match: { 'lead.created_by': new Types.ObjectId(createdById) } }];
}

const projectStage: PipelineStage = {
	$project: {
		id: { $toString: '$_id' },
		status: '$status',
		decisionNotes: '$decision_notes',
		recordingLink: '$recording_link',
		qaNotes: '$qa_notes',
		loanOfficerNotes: '$loan_officer_notes',
		createdAt: {
			$dateToString: { date: '$created_at', format: '%Y-%m-%dT%H:%M:%S.%LZ' },
		},
		updatedAt: {
			$dateToString: { date: '$updated_at', format: '%Y-%m-%dT%H:%M:%S.%LZ' },
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
		lead: {
			id: { $toString: '$lead._id' },
			customerName: '$lead.customer_name',
			customerNumber: '$lead.customer_number',
			loanType: '$lead.loan_type',
			campaign: '$lead.campaign',
			recordingLink: '$lead.recording_link',
			status: '$lead.status',
			updatedAt: {
				$dateToString: {
					date: '$lead.updated_at',
					format: '%Y-%m-%dT%H:%M:%S.%LZ',
				},
			},
		},
		agent: {
			id: { $ifNull: [{ $toString: '$agent._id' }, ''] },
			name: { $ifNull: ['$agent.name', 'Unknown'] },
		},
		loanOfficer: {
			id: { $ifNull: [{ $toString: '$loan_officer._id' }, ''] },
			name: { $ifNull: ['$loan_officer.name', 'Unknown'] },
		},
		createdBy: {
			id: { $ifNull: [{ $toString: '$created_by_user._id' }, ''] },
			name: { $ifNull: ['$created_by_user.name', 'Unknown'] },
		},
		updatedBy: {
			$cond: [
				{ $ifNull: ['$updated_by_user._id', false] },
				{
					id: { $toString: '$updated_by_user._id' },
					name: { $ifNull: ['$updated_by_user.name', 'Unknown'] },
				},
				undefined,
			],
		},
		deletedBy: {
			$cond: [
				{ $ifNull: ['$deleted_by_user._id', false] },
				{
					id: { $toString: '$deleted_by_user._id' },
					name: { $ifNull: ['$deleted_by_user.name', 'Unknown'] },
				},
				undefined,
			],
		},
		_id: 0,
	},
};

export async function listDisputes(
	input: Partial<ListDisputesInput> = {},
): Promise<ListDisputesResult> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');

	const validatedInput = listDisputesInputSchema.parse(input);
	const filterMatch: Record<string, unknown> = {
		deleted_at: { $exists: false },
		...getDateMatch(validatedInput.startDate, validatedInput.endDate),
	};

	if (validatedInput.id && Types.ObjectId.isValid(validatedInput.id)) {
		filterMatch._id = new Types.ObjectId(validatedInput.id);
	}

	if (validatedInput.status) filterMatch.status = validatedInput.status;

	const skip = (validatedInput.page - 1) * validatedInput.limit;
	const lookupStages = createLookupStages();
	const leadVisibilityStages = createLeadVisibilityStages(currentUser);
	const scopedStages = getScopedMatchStages(currentUser);
	const createdByStages = createCreatedByFilterMatch(
		validatedInput.createdById,
	);
	const searchStages = createSearchMatch(validatedInput.search);
	const filteredPipeline: PipelineStage[] = [
		{ $match: filterMatch },
		...lookupStages,
		...leadVisibilityStages,
		...scopedStages,
		...createdByStages,
		...searchStages,
	];

	const [disputes, totalResult, statsResult] = await Promise.all([
		Disputes.aggregate([
			...filteredPipeline,
			{ $sort: { created_at: -1 } },
			{ $skip: skip },
			{ $limit: validatedInput.limit },
			projectStage,
		]),
		Disputes.aggregate([...filteredPipeline, { $count: 'total' }]),
		Disputes.aggregate([
			...filteredPipeline,
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]),
	]);

	const stats = {
		total: 0,
		unresolved: 0,
		resolved: 0,
	};

	for (const item of statsResult as Array<{
		_id: DisputeStatus;
		count: number;
	}>) {
		stats.total += item.count;
		if (item._id === DisputeStatus.UNRESOLVED) stats.unresolved = item.count;
		if (item._id === DisputeStatus.RESOLVED) stats.resolved = item.count;
	}

	return {
		disputes: disputes as ListedDispute[],
		stats,
		total: totalResult[0]?.total || 0,
		page: validatedInput.page,
		limit: validatedInput.limit,
	};
}
