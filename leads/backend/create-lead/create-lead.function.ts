import { connectToDatabase } from '@/common/database';
import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { Leads } from '@/common/models/leads.schema';
import type { CreateLeadInput } from './create-lead.type';
import { createLeadInputSchema } from './create-lead.input-schema';

export async function createLead(input: CreateLeadInput) {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();

	// Validate input
	const validatedData = createLeadInputSchema.parse(input);

	const newLead = new Leads({
		...validatedData,
		created_by: currentUserId,
		status: 'pending',
	});

	await newLead.save();

	return newLead;
}
