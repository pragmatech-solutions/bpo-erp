import { z } from 'zod';
import {
	INSELLERATE_CLIENT_VALUES,
	INSELLERATE_EMPLOYMENT_STATUS_VALUES,
	INSELLERATE_LOAN_TYPE_VALUES,
	INSELLERATE_VETERAN_VALUES,
} from '@/common/constants/insellerate-lead-options';

const optionalSelect = (values: [string, ...string[]]) =>
	z.union([z.enum(values), z.literal('')]).optional();

export const createInsellerateLeadInputSchema = z.object({
	client_campaign: z.enum(INSELLERATE_CLIENT_VALUES, {
		message: 'Client is required',
	}),
	first_name: z
		.string()
		.trim()
		.min(1, 'First name is required')
		.max(50, 'First name must be at most 50 characters'),
	last_name: z
		.string()
		.trim()
		.min(1, 'Last name is required')
		.max(50, 'Last name must be at most 50 characters'),
	city: z
		.string()
		.trim()
		.min(1, 'City is required')
		.max(32, 'City must be at most 32 characters'),
	state: z
		.string()
		.trim()
		.toUpperCase()
		.regex(/^[A-Z]{2}$/, 'State must be a 2-letter code'),
	address: z
		.string()
		.trim()
		.max(100, 'Address must be at most 100 characters')
		.optional(),
	zip: z
		.string()
		.trim()
		.min(1, 'Zip code is required')
		.max(10, 'Zip code must be at most 10 characters'),
	email: z
		.string()
		.trim()
		.max(255, 'Email must be at most 255 characters')
		.email('Invalid email address')
		.optional()
		.or(z.literal('')),
	mobile: z
		.string()
		.trim()
		.min(1, 'Mobile phone is required')
		.max(25, 'Mobile phone must be at most 25 characters')
		.regex(/^[0-9\s()+-]+$/, 'Invalid mobile phone format'),
	mortgage_balance: z.number().nonnegative().optional(),
	loan_amount: z.number().nonnegative().optional(),
	interest_rate: z.number().min(0).max(100).optional(),
	credit_score: z.number().int().min(300).max(850).optional(),
	veteran: optionalSelect(INSELLERATE_VETERAN_VALUES),
	loan_type: optionalSelect(INSELLERATE_LOAN_TYPE_VALUES),
	employment_status: optionalSelect(INSELLERATE_EMPLOYMENT_STATUS_VALUES),
});

export type CreateInsellerateLeadInput = z.infer<
	typeof createInsellerateLeadInputSchema
>;
