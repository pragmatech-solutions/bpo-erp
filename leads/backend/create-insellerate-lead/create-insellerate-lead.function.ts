import { Types } from 'mongoose';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import { Leads } from '@/common/models/leads.schema';
import {
	ensureLeadContactNumberIsUnique,
	isDuplicateLeadContactNumberError,
} from '@/leads/backend/lead-contact-number';
import submitInsellerateLead from '@/leads/backend/submit-insellerate-lead';
import {
	createInsellerateLeadInputSchema,
	type CreateInsellerateLeadInput,
} from './create-insellerate-lead.input-schema';

const insellerateCreatorRoles = [
	UserRole.MANAGER,
	UserRole.TEAM_LEAD,
	UserRole.AGENT,
];

const loanTypeMap: Record<string, LoanType> = {
	VA: LoanType.VA,
	FHA: LoanType.FHA,
	CONVENTIONAL: LoanType.CONVENTIONAL,
};

function buildUsername(input: CreateInsellerateLeadInput) {
	if (input.email && input.email.trim()) return input.email.trim();

	return input.mobile.replace(/\s+/g, '');
}

export async function createInsellerateLead(input: CreateInsellerateLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (!insellerateCreatorRoles.includes(currentUser.role)) {
		throw new Error('Forbidden: Insellerate lead creation access denied');
	}

	const validatedData = createInsellerateLeadInputSchema.parse(input);
	const normalizedCustomerNumber = await ensureLeadContactNumberIsUnique(
		validatedData.mobile,
	);

	const { prospectId } = await submitInsellerateLead(validatedData);

	const newLead = new Leads({
		lead_type: 'insellerate',
		created_by: new Types.ObjectId(currentUser.id),
		status: 'pending',
		customer_name: `${validatedData.first_name} ${validatedData.last_name}`,
		customer_number: validatedData.mobile,
		customer_number_normalized: normalizedCustomerNumber,
		username: buildUsername(validatedData),
		campaign: validatedData.client_campaign,
		loan_type:
			loanTypeMap[validatedData.loan_type ?? ''] ?? LoanType.CONVENTIONAL,
		loan_balance: validatedData.mortgage_balance,
		insellerate: {
			client_campaign: validatedData.client_campaign,
			first_name: validatedData.first_name,
			last_name: validatedData.last_name,
			address: validatedData.address || undefined,
			city: validatedData.city,
			state: validatedData.state,
			zip: validatedData.zip,
			email: validatedData.email || undefined,
			mobile: validatedData.mobile,
			mortgage_balance: validatedData.mortgage_balance,
			loan_amount: validatedData.loan_amount,
			interest_rate: validatedData.interest_rate,
			credit_score: validatedData.credit_score,
			veteran: validatedData.veteran || undefined,
			loan_type: validatedData.loan_type || undefined,
			employment_status: validatedData.employment_status || undefined,
			prospect_id: prospectId,
		},
	});

	try {
		await newLead.save();
	} catch (error) {
		console.error(
			'Insellerate lead was accepted by the client portal but failed to save locally',
			error,
		);
		if (isDuplicateLeadContactNumberError(error)) {
			throw new Error('Lead with this contact number already exists');
		}
		throw error;
	}

	return newLead;
}
