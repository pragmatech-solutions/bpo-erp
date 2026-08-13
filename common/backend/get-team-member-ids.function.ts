import { Types } from 'mongoose';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Users } from '@/common/models/users.schema';

export type TeamMemberIds = {
	agentIds: Types.ObjectId[];
	loanOfficerIds: Types.ObjectId[];
};

type TeamMemberDocument = {
	_id: Types.ObjectId;
	role: UserRole;
};

export async function getTeamMemberIds(teamId: string): Promise<TeamMemberIds> {
	if (!Types.ObjectId.isValid(teamId)) {
		return { agentIds: [], loanOfficerIds: [] };
	}

	const members = await Users.find({
		role: { $in: [UserRole.AGENT, UserRole.LOAN_OFFICER] },
		status: 'active',
		team_id: new Types.ObjectId(teamId),
	})
		.select('_id role')
		.lean<TeamMemberDocument[]>();

	return {
		agentIds: members
			.filter((member) => member.role === UserRole.AGENT)
			.map((member) => member._id),
		loanOfficerIds: members
			.filter((member) => member.role === UserRole.LOAN_OFFICER)
			.map((member) => member._id),
	};
}

export function createTeamMemberLeadMatch({
	agentIds,
	loanOfficerIds,
}: TeamMemberIds): Record<string, unknown> {
	return {
		$or: [
			{ created_by: { $in: agentIds } },
			{ loan_officer_id: { $in: loanOfficerIds } },
		],
	};
}

export async function buildTeamLeadLeadMatch(
	teamId: string,
	requestedMemberId?: string,
): Promise<Record<string, unknown>> {
	const memberIds = await getTeamMemberIds(teamId);

	if (!requestedMemberId) {
		return createTeamMemberLeadMatch(memberIds);
	}

	const selectedAgentId = memberIds.agentIds.find(
		(agentId) => agentId.toString() === requestedMemberId,
	);
	if (selectedAgentId) return { created_by: selectedAgentId };

	const selectedLoanOfficerId = memberIds.loanOfficerIds.find(
		(loanOfficerId) => loanOfficerId.toString() === requestedMemberId,
	);
	if (selectedLoanOfficerId) {
		return { loan_officer_id: selectedLoanOfficerId };
	}

	return { created_by: { $in: [] } };
}
