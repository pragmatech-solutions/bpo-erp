import type { CreateInsellerateLeadInput } from '@/leads/backend/create-insellerate-lead/create-insellerate-lead.input-schema';

export type SubmitInsellerateLeadInput = CreateInsellerateLeadInput;

export type SubmitInsellerateLeadResult = {
	prospectId?: string;
};
