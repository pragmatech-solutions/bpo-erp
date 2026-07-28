import { z } from 'zod';
import {
	CALL_TRANSFER_CREDIT_RATINGS,
	CALL_TRANSFER_LOAN_PURPOSES,
	CALL_TRANSFER_LOAN_TYPES,
} from '@/common/constants/call-transfer-lead-options';

export const createCallTransferLeadInputSchema = z.object({
	first_name: z.string().trim().min(1, 'First name is required'),
	last_name: z.string().trim().min(1, 'Last name is required'),
	origin_phone: z
		.string()
		.trim()
		.min(1, 'Origin phone is required')
		.regex(/^[0-9\s()+-]+$/, 'Invalid origin phone format'),
	address: z.string().trim().min(1, 'Address is required'),
	city: z.string().trim().min(1, 'City is required'),
	state: z.string().trim().min(1, 'State is required'),
	zip: z.string().trim().min(1, 'ZIP is required'),
	email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
	home_value: z.number().positive('Home value must be greater than zero'),
	mortgage_balance: z
		.number()
		.nonnegative('Mortgage balance cannot be negative'),
	mortgage_rate_type: z.string().trim().optional(),
	property_type: z.string().trim().optional(),
	multiple_properties: z.enum(['Yes', 'No']).default('No'),
	mortgage_rate: z.number().nonnegative().optional(),
	cash_out_amount: z.number().nonnegative().optional(),
	loan_type: z.enum(CALL_TRANSFER_LOAN_TYPES),
	loan_purpose: z.enum(CALL_TRANSFER_LOAN_PURPOSES),
	credit: z.enum(CALL_TRANSFER_CREDIT_RATINGS),
	loan_officer_id: z.string().trim().min(1, 'Loan officer is required'),
});

export type CreateCallTransferLeadInput = z.infer<
	typeof createCallTransferLeadInputSchema
>;