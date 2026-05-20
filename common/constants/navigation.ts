import {
	LayoutDashboard,
	Users,
	UserPlus,
	Settings,
	LogOut,
} from 'lucide-react';

export const NAVIGATION_LINKS = [
	{
		label: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		label: 'Lead List',
		href: '/leads/list',
		icon: Users,
	},
	{
		label: 'Create Lead',
		href: '/leads/create',
		icon: UserPlus,
	},
];

export const BOTTOM_NAVIGATION_LINKS = [
	{
		label: 'Setting',
		href: '/settings',
		icon: Settings,
	},
	{
		label: 'Logout',
		href: '/logout',
		icon: LogOut,
	},
];
