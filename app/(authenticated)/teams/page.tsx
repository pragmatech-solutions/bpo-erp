export const dynamic = 'force-dynamic';

import { TeamOverview } from '@/teams/frontend/team-overview';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { notFound } from 'next/navigation';

export default async function TeamsPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser || currentUser.role !== UserRole.ADMIN) {
		notFound();
	}

	return <TeamOverview />;
}

