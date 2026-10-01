import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Disputes } from '@/common/models/disputes.schema';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import {
	resolveDisputeInputSchema,
	type ResolveDisputeInput,
} from './resolve-dispute.input-schema';

type LeadDocument = {
	_id: Types.ObjectId;
	created_by?: Types.ObjectId | null;
	loan_officer_id?: Types.ObjectId | null;
	deleted_at?: Date;
};

type UserTeamDocument = {
	team_id?: Types.ObjectId | null;
};

async function managerCanAccessLead(lead: LeadDocument, teamId: string) {
	const partyIds = [lead.created_by, lead.loan_officer_id].filter(Boolean);
	if (partyIds.length === 0) return false;

	const users = await Users.find({ _id: { $in: partyIds } })
		.select('team_id')
		.lean<UserTeamDocument[]>();

	return users.some((user) => user.team_id?.toString() === teamId);
}

export async function resolveDispute(input: ResolveDisputeInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.MANAGER
	) {
		throw new Error('Forbidden: Only admins and managers can resolve disputes');
	}

	const validatedInput = resolveDisputeInputSchema.parse(input);
	if (!Types.ObjectId.isValid(validatedInput.id))
		throw new Error('Dispute not found');

	const dispute = await Disputes.findById(validatedInput.id);
	if (!dispute || dispute.deleted_at) throw new Error('Dispute not found');

	const lead = await Leads.findById(dispute.lead_id)
		.select('_id created_by loan_officer_id deleted_at')
		.lean<LeadDocument>();
	if (!lead || (lead.deleted_at && currentUser.role !== UserRole.ADMIN))
		throw new Error('Lead not found');

	if (currentUser.role === UserRole.MANAGER) {
		if (
			!currentUser.teamId ||
			!(await managerCanAccessLead(lead, currentUser.teamId))
		) {
			throw new Error('Dispute not found');
		}
	}

	if (dispute.status !== DisputeStatus.UNRESOLVED) {
		throw new Error('Only unresolved disputes can be resolved');
	}

	dispute.status = DisputeStatus.RESOLVED;
	dispute.decision_notes = validatedInput.decisionNotes;
	dispute.updated_by = new Types.ObjectId(currentUser.id);

	const leadUpdate: Record<string, unknown> = {
		status: validatedInput.decision,
		status_reason: validatedInput.decisionNotes,
	};
	if (validatedInput.decision === LeadStatus.BILLABLE) {
		leadUpdate.payment_status = 'unpaid';
	}

	await Promise.all([
		dispute.save(),
		Leads.findByIdAndUpdate(dispute.lead_id, leadUpdate),
	]);

	return { success: true, message: 'Dispute resolved successfully' };
}
