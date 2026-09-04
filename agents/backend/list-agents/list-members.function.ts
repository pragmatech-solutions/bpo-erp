import { Types } from 'mongoose';
import { getCurrentAuthenticatedUser } from '@/common/backend/get-current-authenticated-user.function';
import { connectToDatabase } from '@/common/database';
import { Users } from '@/common/models/users.schema';
import { UserRole } from '@/common/constants/user-roles.enum';
import type { AgentListItem } from './list-agents.type';

const TEAM_FILTERABLE_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
	UserRole.LOAN_OFFICER,
];

export async function listMembers(): Promise<AgentListItem[]> {
	await connectToDatabase();
	const currentUser = await getCurrentAuthenticatedUser();

	if (!currentUser) throw new Error('Unauthorized');

	const agentFilter: Record<string, unknown> = {
		role: UserRole.AGENT,
	};

	if (
		currentUser.role === UserRole.TEAM_LEAD ||
		currentUser.role === UserRole.MANAGER
	) {
		if (!currentUser.teamId) {
			throw new Error('Forbidden: Team-scoped user is not assigned to a team');
		}

		agentFilter.role = { $in: TEAM_FILTERABLE_ROLES };
		agentFilter.team_id = new Types.ObjectId(currentUser.teamId);
	} else if (
		currentUser.role !== UserRole.ADMIN &&
		currentUser.role !== UserRole.QUALITY_ASSURANCE
	) {
		throw new Error('Forbidden: Admin, QA, manager, or team lead access only');
	} else {
		agentFilter.status = 'active';
	}

	const agents = await Users.find(agentFilter).sort({ name: 1 }).lean();

	return agents.map((agent) => ({
		id: String(agent._id),
		name: String(agent.name),
		status: agent.status as AgentListItem['status'],
		role: agent.role as UserRole,
	}));
}
