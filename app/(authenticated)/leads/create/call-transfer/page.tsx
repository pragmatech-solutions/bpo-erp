import { notFound } from 'next/navigation';
import CallTransferLeadForm from '@/leads/frontend/call-transfer-lead-form';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';

export default async function CreateCallTransferLeadPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.AGENT &&
			currentUser.role !== UserRole.MANAGER &&
			currentUser.role !== UserRole.TEAM_LEAD)
	) {
		notFound();
	}

	return <CallTransferLeadForm />;
}
