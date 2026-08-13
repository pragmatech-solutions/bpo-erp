import { Types } from 'mongoose';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import {
	ensureLeadContactNumberIsUnique,
	isDuplicateLeadContactNumberError,
} from '@/leads/backend/lead-contact-number';
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
	const normalizedCustomerNumber = await ensureLeadContactNumberIsUnique(
		validatedData.customer_number,
	);
	const { loan_officer_id, ...leadData } = validatedData;
	let loanOfficerFields = {};

	if (loan_officer_id) {
		if (!Types.ObjectId.isValid(loan_officer_id)) {
			throw new Error('Loan officer not found');
		}

		const loanOfficer = await Users.findOne({
			_id: loan_officer_id,
			role: UserRole.LOAN_OFFICER,
			status: 'active',
			availability_status: UserAvailabilityStatus.ACTIVE,
		})
			.select('_id name')
			.lean<{ _id: Types.ObjectId; name: string }>();
		if (!loanOfficer) throw new Error('Loan officer not found');

		loanOfficerFields = {
			loan_officer_id: loanOfficer._id,
			loan_officer_name: loanOfficer.name,
		};
	}

	const newLead = new Leads({
		...leadData,
		...loanOfficerFields,
		customer_number_normalized: normalizedCustomerNumber,
		created_by: new Types.ObjectId(currentUser.id),
		status: 'pending',
	});

	try {
		await newLead.save();
	} catch (error) {
		if (isDuplicateLeadContactNumberError(error)) {
			throw new Error('Lead with this contact number already exists');
		}
		throw error;
	}

	return newLead;
}
