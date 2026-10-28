export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import { connectToDatabase } from '@/common/database';
import { CallTransferSheetEditor } from '@/portal-settings/frontend/call-transfer-sheet-editor';

export default async function CallTransferSheetSettingsPage() {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser || currentUser.role !== UserRole.ADMIN) {
		notFound();
	}

	return <CallTransferSheetEditor />;
}
