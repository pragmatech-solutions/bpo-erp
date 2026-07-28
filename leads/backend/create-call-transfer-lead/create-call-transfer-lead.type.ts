import type { CreateCallTransferLeadInput } from './create-call-transfer-lead.input-schema';

export type { CreateCallTransferLeadInput };

export type CreateCallTransferLeadResponse = {
	success: boolean;
	message?: string;
	data?: unknown;
	error?: string;
};
