import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { Leads } from '@/common/models/leads.schema';
import type { CreateLeadInput } from './create-lead.type';
import { createLeadInputSchema } from './create-lead.input-schema';

export async function createLead(input: CreateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const validatedData = createLeadInputSchema.parse(input);

	const newLead = new Leads({
		...validatedData,
		created_by: currentUser.id,
		status: 'pending',
	});

	await newLead.save();

	return newLead;
}

