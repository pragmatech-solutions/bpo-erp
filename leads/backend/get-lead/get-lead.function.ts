import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { getTeamAgentObjectIds } from '@/common/backend/get-team-agent-ids.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import type { GetLeadInput, LeadDetails } from './get-lead.type';

type LeadDocument = {
	_id: Types.ObjectId;
	lead_type?: 'standard' | 'call_transfer';
	customer_name: string;
	username: string;
	customer_number: string;
	campaign: string;
	loan_type: LeadDetails['loanType'];
	loan_balance?: number;
	home_value?: number;
	loan_officer_name?: string;
	loan_officer_phone_number?: string;
	loan_officer_id?: {
		_id: Types.ObjectId;
		name: string;
		phone_number?: string;
	} | null;
	call_transfer?: {
		first_name?: string;
		last_name?: string;
		origin_phone?: string;
		address?: string;
		city?: string;
		state?: string;
		zip?: string;
		email?: string;
		home_value?: number;
		mortgage_balance?: number;
		mortgage_rate_type?: string;
		property_type?: string;
		multiple_properties?: string;
		mortgage_rate?: number;
		cash_out_amount?: number;
		loan_type?: string;
		loan_purpose?: string;
		credit?: string;
	};
	status: LeadDetails['status'];
	status_reason?: string;
	payment_status?: 'paid' | 'unpaid';
	deleted_at?: Date;
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
	const canViewPaymentStatus =
		currentUser.role === UserRole.ADMIN ||
		currentUser.role === UserRole.TEAM_LEAD;

	const lead = await Leads.findById(input.id)
		.populate('created_by', 'name')
		.populate('loan_officer_id', 'name phone_number')
		.lean<LeadDocument>();

	if (!lead) throw new Error('Lead not found');

	if (lead.deleted_at && currentUser.role !== UserRole.ADMIN) {
		throw new Error('Lead not found');
	}

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
		const canReadLead =
			lead.created_by._id.toString() === currentUser.id ||
			teamAgentIds.some(
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
		leadType: lead.lead_type || 'standard',
		customerName: lead.customer_name,
		username: lead.username,
		customerNumber: lead.customer_number,
		campaign: lead.campaign,
		loanType: lead.loan_type,
		loanBalance: lead.loan_balance,
		homeValue: lead.home_value,
		loanOfficerId: lead.loan_officer_id?._id.toString(),
		loanOfficerName: lead.loan_officer_id?.name || lead.loan_officer_name,
		loanOfficerPhoneNumber:
			lead.loan_officer_id?.phone_number || lead.loan_officer_phone_number,
		callTransfer: lead.call_transfer
			? {
					firstName: lead.call_transfer.first_name,
					lastName: lead.call_transfer.last_name,
					originPhone: lead.call_transfer.origin_phone,
					address: lead.call_transfer.address,
					city: lead.call_transfer.city,
					state: lead.call_transfer.state,
					zip: lead.call_transfer.zip,
					email: lead.call_transfer.email,
					homeValue: lead.call_transfer.home_value,
					mortgageBalance: lead.call_transfer.mortgage_balance,
					mortgageRateType: lead.call_transfer.mortgage_rate_type,
					propertyType: lead.call_transfer.property_type,
					multipleProperties: lead.call_transfer.multiple_properties,
					mortgageRate: lead.call_transfer.mortgage_rate,
					cashOutAmount: lead.call_transfer.cash_out_amount,
					loanType: lead.call_transfer.loan_type,
					loanPurpose: lead.call_transfer.loan_purpose,
					credit: lead.call_transfer.credit,
				}
			: undefined,
		status: lead.status,
		statusReason: lead.status_reason,
		paymentStatus: canViewPaymentStatus ? lead.payment_status : undefined,
		updatedAt: lead.updated_at.toISOString(),
		created_by: {
			id: lead.created_by._id.toString(),
			name: lead.created_by.name,
		},
	};
}
