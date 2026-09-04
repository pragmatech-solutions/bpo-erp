import { Types } from 'mongoose';
import { UserRole } from '@/common/constants/user-roles.enum';
import { Users } from '@/common/models/users.schema';

export type TeamMemberIds = {
	leadCreatorIds: Types.ObjectId[];
	agentIds: Types.ObjectId[];
	loanOfficerIds: Types.ObjectId[];
};

type TeamMemberDocument = {
	_id: Types.ObjectId;
	role: UserRole;
};

const TEAM_LEAD_CREATOR_ROLES = [
	UserRole.AGENT,
	UserRole.TEAM_LEAD,
	UserRole.MANAGER,
];

const TEAM_SCOPED_ROLES = [...TEAM_LEAD_CREATOR_ROLES, UserRole.LOAN_OFFICER];

export async function getTeamMemberIds(teamId: string): Promise<TeamMemberIds> {
	if (!Types.ObjectId.isValid(teamId)) {
		return { leadCreatorIds: [], agentIds: [], loanOfficerIds: [] };
	}

	const members = await Users.find({
		role: { $in: TEAM_SCOPED_ROLES },
		team_id: new Types.ObjectId(teamId),
	})
		.select('_id role')
		.lean<TeamMemberDocument[]>();

	return {
		leadCreatorIds: members
			.filter((member) => TEAM_LEAD_CREATOR_ROLES.includes(member.role))
			.map((member) => member._id),
		agentIds: members
			.filter((member) => member.role === UserRole.AGENT)
			.map((member) => member._id),
		loanOfficerIds: members
			.filter((member) => member.role === UserRole.LOAN_OFFICER)
			.map((member) => member._id),
	};
}

export function createTeamMemberLeadMatch({
	leadCreatorIds,
	loanOfficerIds,
}: TeamMemberIds): Record<string, unknown> {
	return {
		$or: [
			{ created_by: { $in: leadCreatorIds } },
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

	const selectedLeadCreatorId = memberIds.leadCreatorIds.find(
		(creatorId) => creatorId.toString() === requestedMemberId,
	);
	if (selectedLeadCreatorId) return { created_by: selectedLeadCreatorId };

	const selectedLoanOfficerId = memberIds.loanOfficerIds.find(
		(loanOfficerId) => loanOfficerId.toString() === requestedMemberId,
	);
	if (selectedLoanOfficerId) {
		return { loan_officer_id: selectedLoanOfficerId };
	}

	return { created_by: { $in: [] } };
}
