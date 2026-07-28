import {
	LayoutDashboard,
	Users,
	UserPlus,
	Settings,
	LogOut,
	Megaphone,
	UserCog,
	UsersRound,
} from 'lucide-react';
import { UserRole } from './user-roles.enum';

export const NAVIGATION_LINKS = [
	{
		label: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
		roles: [UserRole.ADMIN, UserRole.TEAM_LEAD, UserRole.AGENT],
	},
	{
		label: 'Lead List',
		href: '/leads/list',
		icon: Users,
		roles: [
			UserRole.ADMIN,
			UserRole.TEAM_LEAD,
			UserRole.AGENT,
			UserRole.QUALITY_ASSURANCE,
			UserRole.LOAN_OFFICER,
		],
	},
	{
		label: 'Create Lead',
		href: '/leads/create',
		icon: UserPlus,
		roles: [UserRole.ADMIN, UserRole.TEAM_LEAD, UserRole.AGENT],
	},
	{
		label: 'Teams',
		href: '/teams',
		icon: UsersRound,
		roles: [UserRole.ADMIN, UserRole.TEAM_LEAD],
	},
	{
		label: 'User',
		href: '/users',
		icon: UserCog,
		roles: [UserRole.ADMIN],
	},
	{
		label: 'Campaign',
		href: '/campaigns',
		icon: Megaphone,
		roles: [UserRole.ADMIN],
	},
];

export const BOTTOM_NAVIGATION_OPTIONS = [
	{
		label: 'Setting',
		href: '/settings',
		icon: Settings,
	},
	{
		label: 'Logout',
		icon: LogOut,
	},
];
