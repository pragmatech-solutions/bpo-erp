export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { TeamPerformance } from '@/teams/frontend/team-performance';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';

export default async function TeamPerformancePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
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

	const { id } = await params;
	return <TeamPerformance id={id} />;
}
