import { notFound } from 'next/navigation';
import InsellerateLeadForm from '@/leads/frontend/insellerate-lead-form';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';

export default async function CreateInsellerateLeadPage() {
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

	return <InsellerateLeadForm />;
}
