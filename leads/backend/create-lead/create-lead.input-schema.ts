import { z } from 'zod';
import { LoanType } from '@/common/constants/loan-type.enum';

export const createLeadInputSchema = z.object({
	customer_name: z.string().min(1, 'Customer name is required'),
	customer_number: z
		.string()
		.min(1, 'Customer number is required')
		.regex(/^[0-9\s()+-]+$/, 'Invalid number format'),
	campaign: z.string().min(1, 'Campaign is required'),
	loan_type: z.nativeEnum(LoanType).refine((value) => !!value, {
		message: 'Invalid loan type',
	}),
	loan_balance: z.number().optional(),
	home_value: z.number().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadInputSchema>;
