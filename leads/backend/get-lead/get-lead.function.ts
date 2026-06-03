import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { connectToDatabase } from '@/common/database';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import type { GetLeadInput, LeadDetails } from './get-lead.type';

export async function getLead(input: GetLeadInput): Promise<LeadDetails> {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();

	if (!currentUserId) throw new Error('Unauthorized');

	const currentUser = await Users.findById(currentUserId).lean();
	if (!currentUser || currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden: Only admins can access this');
	}

	const lead = await Leads.findById(input.id)
		.populate('created_by', 'name')
		.lean();

	if (!lead) throw new Error('Lead not found');

	return {
		id: lead._id.toString(),
		customerName: lead.customer_name,
		customerNumber: lead.customer_number,
		loanType: lead.loan_type,
		status: lead.status,
		statusReason: lead.status_reason,
		updatedAt: lead.updated_at.toISOString(),
		created_by: {
			id: lead.created_by._id.toString(),
			name: lead.created_by.name,
		},
	};
}
