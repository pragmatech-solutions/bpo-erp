export const dynamic = 'force-dynamic';

import { UserManagement } from '@/users/frontend/user-management';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { notFound } from 'next/navigation';

export default async function UsersPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN &&
			currentUser.role !== UserRole.MANAGER &&
			currentUser.role !== UserRole.TEAM_LEAD)
	) {
		notFound();
	}

	return <UserManagement />;
}
