import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import { Users } from '@/common/models/users.schema';
import type { LoanOfficerOption } from './list-loan-officers.type';

type LoanOfficerDocument = {
	_id: { toString(): string };
	name: string;
	phone_number?: string;
};

const allowedLeadCreatorRoles = [
	UserRole.ADMIN,
	UserRole.TEAM_LEAD,
	UserRole.AGENT,
];

export async function listLoanOfficers(): Promise<LoanOfficerOption[]> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');
	if (!allowedLeadCreatorRoles.includes(currentUser.role)) {
		throw new Error('Forbidden: Lead creator access only');
	}

	const loanOfficers = await Users.find({
		role: UserRole.LOAN_OFFICER,
		status: 'active',
		availability_status: UserAvailabilityStatus.ACTIVE,
	})
		.select('_id name phone_number')
		.sort({ name: 1 })
		.lean<LoanOfficerDocument[]>();

	return loanOfficers.map((loanOfficer) => ({
		id: loanOfficer._id.toString(),
		name: loanOfficer.name,
		phoneNumber: loanOfficer.phone_number,
	}));
}
