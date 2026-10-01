import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Disputes } from '@/common/models/disputes.schema';
import { Leads } from '@/common/models/leads.schema';
import {
	createDisputeInputSchema,
	type CreateDisputeInput,
} from './create-dispute.input-schema';

type LeadDocument = {
	_id: Types.ObjectId;
	loan_officer_id?: Types.ObjectId | null;
	deleted_at?: Date;
};

function isDuplicatePendingDisputeError(error: unknown) {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: number }).code === 11000
	);
}

export async function createDispute(input: CreateDisputeInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (
		currentUser.role !== UserRole.QUALITY_ASSURANCE &&
		currentUser.role !== UserRole.ADMIN
	) {
		throw new Error('Forbidden: Only QA and admins can create disputes');
	}

	const validatedInput = createDisputeInputSchema.parse(input);
	if (!Types.ObjectId.isValid(validatedInput.leadId)) {
		throw new Error('Lead not found');
	}

	const lead = await Leads.findById(validatedInput.leadId)
		.select('_id loan_officer_id deleted_at')
		.lean<LeadDocument>();
	if (!lead || lead.deleted_at) throw new Error('Lead not found');
	if (!lead.loan_officer_id) {
		throw new Error('A loan officer is required before opening a dispute');
	}

	const existingPendingDispute = await Disputes.findOne({
		lead_id: lead._id,
		status: DisputeStatus.UNRESOLVED,
		deleted_at: { $exists: false },
	}).select('_id');
	if (existingPendingDispute) {
		throw new Error('An unresolved dispute already exists for this lead');
	}

	let dispute: { _id: Types.ObjectId };
	try {
		dispute = await Disputes.create({
			lead_id: lead._id,
			created_by: new Types.ObjectId(currentUser.id),
			recording_link: validatedInput.recordingLink,
			qa_notes: validatedInput.qaNotes,
			status: DisputeStatus.UNRESOLVED,
		});
	} catch (error: unknown) {
		if (isDuplicatePendingDisputeError(error)) {
			throw new Error('An unresolved dispute already exists for this lead');
		}

		throw error;
	}

	return {
		success: true,
		message: 'Dispute created successfully',
		id: dispute._id.toString(),
	};
}
