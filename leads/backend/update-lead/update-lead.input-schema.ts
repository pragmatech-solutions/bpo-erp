import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { LoanType } from '@/common/constants/loan-type.enum';
import {
	CALL_TRANSFER_CREDIT_RATINGS,
	CALL_TRANSFER_LOAN_PURPOSES,
	CALL_TRANSFER_LOAN_TYPES,
} from '@/common/constants/call-transfer-lead-options';

const optionalNumberSchema = z.number().nonnegative().optional();

export const updateLeadInputSchema = z
	.object({
		id: z.string(),
		status: z.nativeEnum(LeadStatus),
		statusReason: z.string().optional(),
		paymentStatus: z.enum(['paid', 'unpaid']).optional(),
		customerName: z.string().trim().min(1).optional(),
		username: z.string().trim().min(1).optional(),
		customerNumber: z
			.string()
			.trim()
			.min(1)
			.regex(/^[0-9\s()+-]+$/, 'Invalid number format')
			.optional(),
		campaign: z.string().trim().min(1).optional(),
		loanType: z.nativeEnum(LoanType).optional(),
		loanBalance: optionalNumberSchema,
		homeValue: optionalNumberSchema,
		loanOfficerId: z.string().trim().optional(),
		callTransfer: z
			.object({
				firstName: z.string().trim().min(1).optional(),
				lastName: z.string().trim().min(1).optional(),
				originPhone: z
					.string()
					.trim()
					.min(1)
					.regex(/^[0-9\s()+-]+$/, 'Invalid origin phone format')
					.optional(),
				address: z.string().trim().min(1).optional(),
				city: z.string().trim().min(1).optional(),
				state: z.string().trim().min(1).optional(),
				zip: z.string().trim().min(1).optional(),
				email: z
					.string()
					.trim()
					.email('Invalid email address')
					.optional()
					.or(z.literal('')),
				homeValue: z.number().positive().optional(),
				mortgageBalance: optionalNumberSchema,
				mortgageRateType: z.string().trim().optional(),
				propertyType: z.string().trim().optional(),
				multipleProperties: z.enum(['Yes', 'No']).optional(),
				mortgageRate: optionalNumberSchema,
				cashOutAmount: optionalNumberSchema,
				loanType: z.enum(CALL_TRANSFER_LOAN_TYPES).optional(),
				loanPurpose: z.enum(CALL_TRANSFER_LOAN_PURPOSES).optional(),
				credit: z.enum(CALL_TRANSFER_CREDIT_RATINGS).optional(),
			})
			.optional(),
	})
	.refine(
		(data) => {
			if (data.status === LeadStatus.NON_BILLABLE) {
				return !!data.statusReason && data.statusReason.trim().length > 0;
			}
			return true;
		},
		{
			message: 'Status reason is required for non-billable leads',
			path: ['statusReason'],
		},
	);

export type UpdateLeadInput = z.infer<typeof updateLeadInputSchema>;
