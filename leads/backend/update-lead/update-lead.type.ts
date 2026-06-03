import { UpdateLeadInput } from './update-lead.input-schema';

export type UpdateLeadResponse = {
	success: boolean;
	message?: string;
	error?: string;
};

export type { UpdateLeadInput };
