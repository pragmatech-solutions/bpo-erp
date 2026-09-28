import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Disputes } from '@/common/models/disputes.schema';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { listDisputes } from '@/disputes/backend/list-disputes/list-disputes.function';
import type { ListedDispute } from '@/disputes/backend/list-disputes/list-disputes.type';

type LeadDocument = {
	_id: Types.ObjectId;
	created_by?: Types.ObjectId | null;
	loan_officer_id?: Types.ObjectId | null;
	deleted_at?: Date;
};

type UserTeamDocument = {
	team_id?: Types.ObjectId | null;
};

async function teamUserCanAccessLead(lead: LeadDocument, teamId: string) {
	const partyIds = [lead.created_by, lead.loan_officer_id].filter(Boolean);
	if (partyIds.length === 0) return false;

	const users = await Users.find({ _id: { $in: partyIds } })
		.select('team_id')
		.lean<UserTeamDocument[]>();

	return users.some((user) => user.team_id?.toString() === teamId);
}

export async function getDispute(input: { id: string }): Promise<ListedDispute> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser) throw new Error('Unauthorized');
	if (!Types.ObjectId.isValid(input.id)) throw new Error('Dispute not found');

	const dispute = await Disputes.findById(input.id).select('_id lead_id deleted_at');
	if (!dispute || dispute.deleted_at) throw new Error('Dispute not found');

	const lead = await Leads.findById(dispute.lead_id)
		.select('_id created_by loan_officer_id deleted_at')
		.lean<LeadDocument>();
	if (!lead || (lead.deleted_at && currentUser.role !== UserRole.ADMIN)) throw new Error('Dispute not found');

	if (currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.TEAM_LEAD) {
		if (!currentUser.teamId || !(await teamUserCanAccessLead(lead, currentUser.teamId))) {
			throw new Error('Dispute not found');
		}
	} else if (currentUser.role === UserRole.AGENT) {
		if (lead.created_by?.toString() !== currentUser.id) throw new Error('Dispute not found');
	} else if (currentUser.role === UserRole.LOAN_OFFICER) {
		if (lead.loan_officer_id?.toString() !== currentUser.id) throw new Error('Dispute not found');
	} else if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.QUALITY_ASSURANCE) {
		throw new Error('Forbidden');
	}

	const result = await listDisputes({ page: 1, limit: 1, id: input.id });
	const found = result.disputes[0];
	if (!found) throw new Error('Dispute not found');
	return found;
}