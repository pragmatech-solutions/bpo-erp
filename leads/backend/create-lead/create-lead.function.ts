import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Leads } from '@/common/models/leads.schema';
import type { CreateLeadInput } from './create-lead.type';
import { createLeadInputSchema } from './create-lead.input-schema';

export async function createLead(input: CreateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (currentUser.role === UserRole.TEAM_LEAD) {
		throw new Error('Forbidden: Team leads cannot create leads');
	}

	const validatedData = createLeadInputSchema.parse(input);

	const newLead = new Leads({
		...validatedData,
		created_by: currentUser.id,
		status: 'pending',
	});

	await newLead.save();

	return newLead;
}
