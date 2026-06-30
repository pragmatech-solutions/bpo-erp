import { getCurrentUser } from '@/common/backend/get-current-user.function';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import type { AgentListItem } from './list-agents.type';

export async function listAgents(): Promise<AgentListItem[]> {
	await connectToDatabase();
	const currentUserId = await getCurrentUser();

	if (!currentUserId) throw new Error('Unauthorized');

	const currentUser = await Users.findById(currentUserId).lean();
	if (!currentUser) throw new Error('User not found');

	if (currentUser.role !== UserRole.ADMIN) {
		throw new Error('Forbidden: Admin access only');
	}

	const agents = await Users.find({ role: UserRole.AGENT, status: 'active' })
		.sort({ name: 1 })
		.lean();

	return agents.map((agent) => ({
		id: String(agent._id),
		name: String(agent.name),
	}));
}
