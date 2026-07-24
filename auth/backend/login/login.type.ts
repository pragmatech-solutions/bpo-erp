export type LoginCredentials = {
	email: string;
	password: string;
};

export type UserResponse = {
	email: string;
	name: string;
	phone_number?: string;
	status: 'active' | 'inactive' | 'blocked';
	role: 'agent' | 'team_lead' | 'quality_assurance' | 'loan_officer' | 'admin';
	token?: string;
};
