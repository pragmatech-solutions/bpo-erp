type UserResponse = {
	id: string;
	email: string;
	name?: string;
	status: 'active' | 'inactive' | 'pending';
};

export default UserResponse;
