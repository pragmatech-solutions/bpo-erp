import type { CreateInsellerateLeadInput } from './create-insellerate-lead.input-schema';

export type { CreateInsellerateLeadInput };

export type CreateInsellerateLeadResponse = {
	success: boolean;
	message?: string;
	data?: unknown;
	error?: string;
};
