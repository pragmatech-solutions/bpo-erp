import { Types } from 'mongoose';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import { Leads } from '@/common/models/leads.schema';
import { Users } from '@/common/models/users.schema';
import {
	createCallTransferLeadInputSchema,
	type CreateCallTransferLeadInput,
} from './create-call-transfer-lead.input-schema';

const callTransferCreatorRoles = [UserRole.TEAM_LEAD, UserRole.AGENT];

const loanTypeMap: Record<CreateCallTransferLeadInput['loan_type'], LoanType> = {
	Conventional: LoanType.CONVENTIONAL,
	Veteran: LoanType.VA,
	FHA: LoanType.FHA,
	Streamline: LoanType.VA_ELIGIBLE,
};

type LoanOfficerDocument = {
	_id: Types.ObjectId;
	name: string;
	phone_number?: string;
};

function buildCustomerName(firstName: string, lastName: string) {
	return `${firstName.trim()} ${lastName.trim()}`.trim();
}

function buildUsername(input: CreateCallTransferLeadInput) {
	if (input.email && input.email.trim()) return input.email.trim();

	return input.origin_phone.replace(/\s+/g, '');
}

export async function createCallTransferLead(input: CreateCallTransferLeadInput) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (!callTransferCreatorRoles.includes(currentUser.role)) {
		throw new Error('Forbidden: Call transfer lead creation access denied');
	}

	const validatedData = createCallTransferLeadInputSchema.parse(input);
	if (!Types.ObjectId.isValid(validatedData.loan_officer_id)) {
		throw new Error('Loan officer not found');
	}

	const loanOfficer = await Users.findOne({
		_id: validatedData.loan_officer_id,
		role: UserRole.LOAN_OFFICER,
		status: 'active',
	})
		.select('_id name phone_number')
		.lean<LoanOfficerDocument>();
	if (!loanOfficer) throw new Error('Loan officer not found');

	const newLead = new Leads({
		lead_type: 'call_transfer',
		created_by: new Types.ObjectId(currentUser.id),
		status: 'pending',
		customer_name: buildCustomerName(
			validatedData.first_name,
			validatedData.last_name,
		),
		customer_number: validatedData.origin_phone,
		username: buildUsername(validatedData),
		campaign: 'Call Transfer',
		loan_type: loanTypeMap[validatedData.loan_type],
		loan_officer_id: loanOfficer._id,
		loan_officer_name: loanOfficer.name,
		loan_officer_phone_number: loanOfficer.phone_number,
		loan_balance: validatedData.mortgage_balance,
		home_value: validatedData.home_value,
		call_transfer: {
			first_name: validatedData.first_name,
			last_name: validatedData.last_name,
			origin_phone: validatedData.origin_phone,
			address: validatedData.address,
			city: validatedData.city,
			state: validatedData.state,
			zip: validatedData.zip,
			email: validatedData.email || undefined,
			home_value: validatedData.home_value,
			mortgage_balance: validatedData.mortgage_balance,
			mortgage_rate_type: validatedData.mortgage_rate_type || undefined,
			property_type: validatedData.property_type || undefined,
			multiple_properties: validatedData.multiple_properties,
			mortgage_rate: validatedData.mortgage_rate,
			cash_out_amount: validatedData.cash_out_amount,
			loan_type: validatedData.loan_type,
			loan_purpose: validatedData.loan_purpose,
			credit: validatedData.credit,
		},
	});

	await newLead.save();

	return newLead;
}
