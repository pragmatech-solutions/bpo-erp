export type LoginCredentials = {
	email: string;
	password: string;
};

export type UserResponse = {
	email: string;
	name: string;
	status: 'active' | 'inactive' | 'blocked';
	role: 'agent' | 'team_lead' | 'admin';
	token?: string;
};
