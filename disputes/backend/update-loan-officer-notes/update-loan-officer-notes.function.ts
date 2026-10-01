import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Disputes } from '@/common/models/disputes.schema';
import { Leads } from '@/common/models/leads.schema';
import {
	updateLoanOfficerNotesInputSchema,
	type UpdateLoanOfficerNotesInput,
} from './update-loan-officer-notes.input-schema';

type LeadDocument = {
	_id: Types.ObjectId;
	loan_officer_id?: Types.ObjectId | null;
	deleted_at?: Date;
};

export async function updateLoanOfficerNotes(
	input: UpdateLoanOfficerNotesInput,
) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (currentUser.role !== UserRole.LOAN_OFFICER) {
		throw new Error('Forbidden: Only loan officers can add loan officer notes');
	}

	const validatedInput = updateLoanOfficerNotesInputSchema.parse(input);
	if (!Types.ObjectId.isValid(validatedInput.id))
		throw new Error('Dispute not found');

	const dispute = await Disputes.findById(validatedInput.id);
	if (!dispute || dispute.deleted_at) throw new Error('Dispute not found');

	const lead = await Leads.findById(dispute.lead_id)
		.select('_id loan_officer_id deleted_at')
		.lean<LeadDocument>();
	if (!lead || lead.deleted_at) throw new Error('Dispute not found');
	if (lead.loan_officer_id?.toString() !== currentUser.id) {
		throw new Error('Dispute not found');
	}

	if (dispute.status !== DisputeStatus.UNRESOLVED) {
		throw new Error('Notes can only be added to unresolved disputes');
	}

	dispute.loan_officer_notes = validatedInput.loanOfficerNotes;
	dispute.updated_by = new Types.ObjectId(currentUser.id);
	await dispute.save();

	return { success: true, message: 'Loan officer notes saved successfully' };
}
