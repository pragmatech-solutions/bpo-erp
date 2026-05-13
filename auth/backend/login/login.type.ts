export type LoginCredentials = {
	email: string;
	password: string;
};

export type UserResponse = {
	id: string;
	email: string;
	name?: string;
	status: 'active' | 'inactive' | 'pending';
};
