export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { connectToDatabase } from '@/common/database';
import { PortalSettings } from '@/portal-settings/frontend/portal-settings';

export default async function PortalSettingsPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser || currentUser.role !== UserRole.ADMIN) {
		notFound();
	}

	return <PortalSettings />;
}
