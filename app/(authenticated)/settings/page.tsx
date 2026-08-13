export const dynamic = 'force-dynamic';

import { AccountSettings } from '@/account/frontend/account-settings';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { notFound } from 'next/navigation';

export default async function SettingsPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) {
		notFound();
	}

	return <AccountSettings />;
}
