export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { UserRole } from '@/common/constants/user-roles.enum';
import { ReportList } from '@/reports/frontend/report-list';

export default async function ReportsPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN &&
			currentUser.role !== UserRole.MANAGER &&
			currentUser.role !== UserRole.TEAM_LEAD &&
			currentUser.role !== UserRole.AGENT)
	) {
		notFound();
	}

	return <ReportList />;
}
