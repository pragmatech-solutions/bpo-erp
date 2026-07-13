import { Types } from 'mongoose';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Users } from '@/common/models/users.schema';

export async function getTeamAgentObjectIds(teamId: string) {
	if (!Types.ObjectId.isValid(teamId)) {
		return [];
	}

	const agents = await Users.find({
		role: UserRole.AGENT,
		status: 'active',
		team_id: new Types.ObjectId(teamId),
	})
		.select('_id')
		.lean<{ _id: Types.ObjectId }[]>();

	return agents.map((agent) => agent._id);
}
