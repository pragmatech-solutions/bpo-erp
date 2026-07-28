import { notFound } from 'next/navigation';
import { UpdateLeadForm } from '@/leads/frontend/update-lead-form';
import { connectToDatabase } from '@/common/database';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { UserRole } from '@/common/constants/user-roles.enum';

export default async function EditLeadPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (
		!currentUser ||
		(currentUser.role !== UserRole.ADMIN &&
			currentUser.role !== UserRole.QUALITY_ASSURANCE &&
			currentUser.role !== UserRole.LOAN_OFFICER)
	) {
		notFound();
	}

	const id = (await params).id;

	return <UpdateLeadForm id={id} />;
}
