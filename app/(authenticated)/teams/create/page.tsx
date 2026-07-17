export const dynamic = 'force-dynamic';

import { CreateTeamForm } from '@/teams/frontend/create-team-form';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { notFound } from 'next/navigation';

export default async function CreateTeamPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser || currentUser.role !== UserRole.ADMIN) {
		notFound();
	}

	return <CreateTeamForm />;
}

