import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import {
	updateLeadInputSchema,
	type UpdateLeadInput,
} from './update-lead.input-schema';

export async function updateLead(input: UpdateLeadInput) {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();
	if (!currentUserId) throw new Error('Unauthorized');

	const currentUser = await Users.findById(currentUserId).lean<{ role: UserRole }>();
	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN &&
			currentUser.role !== UserRole.QUALITY_ASSURANCE)
	) {
		throw new Error('Forbidden: Only admins or QA can update leads');
	}

	const validatedInput = updateLeadInputSchema.parse(input);
	const lead = await Leads.findById(validatedInput.id);
	if (!lead) throw new Error('Lead not found');

	if (currentUser.role === UserRole.QUALITY_ASSURANCE) {
		if (validatedInput.status === LeadStatus.PENDING) {
			throw new Error('Forbidden: QA can only mark leads billable or non-billable');
		}
		if (validatedInput.paymentStatus === 'paid') {
			throw new Error('Forbidden: Only admins can mark leads as paid');
		}
	}

	lead.status = validatedInput.status;
	lead.status_reason =
		validatedInput.status === LeadStatus.NON_BILLABLE
			? validatedInput.statusReason
			: undefined;

	if (currentUser.role === UserRole.ADMIN) {
		if (validatedInput.paymentStatus !== undefined) {
			lead.payment_status = validatedInput.paymentStatus;
		}
	} else if (validatedInput.status === LeadStatus.BILLABLE) {
		lead.payment_status = 'unpaid';
	}

	await lead.save();
	return { success: true, message: 'Lead updated successfully' };
}
