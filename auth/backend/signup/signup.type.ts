import { UserResponse } from '../login/login.type';

export type SignupResponse = {
	success: boolean;
	message?: string;
	user?: UserResponse;
	error?: string | Record<string, string[]>;
};
