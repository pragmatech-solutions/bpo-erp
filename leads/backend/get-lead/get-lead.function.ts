import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { getTeamAgentObjectIds } from '@/common/backend/get-team-agent-ids.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import type { GetLeadInput, LeadDetails } from './get-lead.type';

type LeadDocument = {
	_id: Types.ObjectId;
	customer_name: string;
	username: string;
	customer_number: string;
	loan_type: LeadDetails['loanType'];
	loan_officer_name?: string;
	loan_officer_id?: {
		_id: Types.ObjectId;
		name: string;
		phone_number?: string;
	} | null;
	status: LeadDetails['status'];
	status_reason?: string;
	payment_status?: 'paid' | 'unpaid';
	updated_at: Date;
	created_by: {
		_id: Types.ObjectId;
		name: string;
	};
};

export async function getLead(input: GetLeadInput): Promise<LeadDetails> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const lead = await Leads.findById(input.id)
		.populate('created_by', 'name')
		.populate('loan_officer_id', 'name phone_number')
		.lean<LeadDocument>();

	if (!lead) throw new Error('Lead not found');

	if (currentUser.role === UserRole.QUALITY_ASSURANCE) {
		// QA can review any lead across teams.
	} else if (currentUser.role === UserRole.LOAN_OFFICER) {
		if (lead.loan_officer_id?._id.toString() !== currentUser.id) {
			throw new Error('Lead not found');
		}
	} else if (currentUser.role === UserRole.TEAM_LEAD) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team lead is not assigned to a team');
		}

		const teamAgentIds = await getTeamAgentObjectIds(currentUser.teamId);
		const canReadLead = teamAgentIds.some(
			(agentId) => agentId.toString() === lead.created_by._id.toString(),
		);

		if (!canReadLead) {
			throw new Error('Lead not found');
		}
	} else if (currentUser.role === UserRole.AGENT) {
		if (lead.created_by._id.toString() !== currentUser.id) {
			throw new Error('Lead not found');
		}
	} else if (currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden');
	}

	return {
		id: lead._id.toString(),
		customerName: lead.customer_name,
		username: lead.username,
		customerNumber: lead.customer_number,
		loanType: lead.loan_type,
		loanOfficerName: lead.loan_officer_id?.name || lead.loan_officer_name,
		loanOfficerPhoneNumber: lead.loan_officer_id?.phone_number,
		status: lead.status,
		statusReason: lead.status_reason,
		paymentStatus: lead.payment_status,
		updatedAt: lead.updated_at.toISOString(),
		created_by: {
			id: lead.created_by._id.toString(),
			name: lead.created_by.name,
		},
	};
}
