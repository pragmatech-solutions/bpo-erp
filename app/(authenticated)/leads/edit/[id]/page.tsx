import { UpdateLeadForm } from '@/leads/frontend/update-lead-form';

export default async function EditLeadPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const id = (await params).id;

	return <UpdateLeadForm id={id} />;
}
