import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import {
	updateLeadInputSchema,
	type UpdateLeadInput,
} from './update-lead.input-schema';

type LeadDocumentWithOfficer = {
	loan_officer_id?: { toString(): string } | null;
	status: LeadStatus;
	status_reason?: string;
	payment_status?: 'paid' | 'unpaid';
	save(): Promise<unknown>;
};

export async function updateLead(input: UpdateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');

	if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.QUALITY_ASSURANCE &&
		currentUser.role !== UserRole.LOAN_OFFICER
	) {
		throw new Error(
			'Forbidden: Only admins, QA, or loan officers can update leads',
		);
	}

	const validatedInput = updateLeadInputSchema.parse(input);
	const lead = await Leads.findById(validatedInput.id).select(
		'loan_officer_id status status_reason payment_status',
	);
	if (!lead) throw new Error('Lead not found');

	const editableLead = lead as LeadDocumentWithOfficer;

	if (currentUser.role === UserRole.LOAN_OFFICER) {
		if (editableLead.loan_officer_id?.toString() !== currentUser.id) {
			throw new Error('Lead not found');
		}
		if (validatedInput.paymentStatus !== undefined) {
			throw new Error('Forbidden: Loan officers cannot update payment status');
		}
	}

	if (
		currentUser.role === UserRole.QUALITY_ASSURANCE ||
		currentUser.role === UserRole.LOAN_OFFICER
	) {
		if (validatedInput.status === LeadStatus.PENDING) {
			throw new Error(
				'Forbidden: Reviewer roles can only mark leads billable or non-billable',
			);
		}
		if (validatedInput.paymentStatus === 'paid') {
			throw new Error('Forbidden: Only admins can mark leads as paid');
		}
	}

	editableLead.status = validatedInput.status;
	editableLead.status_reason =
		validatedInput.status === LeadStatus.NON_BILLABLE
			? validatedInput.statusReason
			: undefined;

	if (currentUser.role === UserRole.ADMIN) {
		if (validatedInput.paymentStatus !== undefined) {
			editableLead.payment_status = validatedInput.paymentStatus;
		}
	} else if (
		currentUser.role === UserRole.QUALITY_ASSURANCE &&
		validatedInput.status === LeadStatus.BILLABLE
	) {
		editableLead.payment_status = 'unpaid';
	}

	await editableLead.save();
	return { success: true, message: 'Lead updated successfully' };
}
