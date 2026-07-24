import { Types } from 'mongoose';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import type { CreateLeadInput } from './create-lead.type';
import { createLeadInputSchema } from './create-lead.input-schema';

const leadCreatorRoles = [UserRole.ADMIN, UserRole.TEAM_LEAD, UserRole.AGENT];

export async function createLead(input: CreateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (!leadCreatorRoles.includes(currentUser.role)) {
		throw new Error('Forbidden: Lead creation access denied');
	}

	const validatedData = createLeadInputSchema.parse(input);
	if (!Types.ObjectId.isValid(validatedData.loan_officer_id)) {
		throw new Error('Loan officer not found');
	}

	const loanOfficer = await Users.findOne({
		_id: validatedData.loan_officer_id,
		role: UserRole.LOAN_OFFICER,
		status: 'active',
	})
		.select('_id name')
		.lean<{ _id: Types.ObjectId; name: string }>();
	if (!loanOfficer) throw new Error('Loan officer not found');

	const newLead = new Leads({
		...validatedData,
		loan_officer_id: loanOfficer._id,
		loan_officer_name: loanOfficer.name,
		created_by: new Types.ObjectId(currentUser.id),
		status: 'pending',
	});

	await newLead.save();

	return newLead;
}
