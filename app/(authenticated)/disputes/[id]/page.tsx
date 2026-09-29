import { notFound } from 'next/navigation';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';
import DisputeDetails from '@/disputes/frontend/dispute-details';

const ALLOWED_ROLES = [
	UserRole.ADMIN,
	UserRole.MANAGER,
	UserRole.TEAM_LEAD,
	UserRole.QUALITY_ASSURANCE,
	UserRole.AGENT,
	UserRole.LOAN_OFFICER,
];

export default async function DisputeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const currentUser = await getCurrentAuthenticatedUser();
	if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) notFound();
	return <DisputeDetails id={(await params).id} />;
}
