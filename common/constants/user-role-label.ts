import { UserRole } from '@/common/constants/user-roles.enum';

export function getUserRoleLabel(role: UserRole) {
	if (role === UserRole.TEAM_LEAD) return 'Team Lead';
	if (role === UserRole.MANAGER) return 'Manager';
	if (role === UserRole.QUALITY_ASSURANCE) return 'Quality Assurance';
	if (role === UserRole.LOAN_OFFICER) return 'Loan Officer';
	return role.charAt(0).toUpperCase() + role.slice(1);
}
