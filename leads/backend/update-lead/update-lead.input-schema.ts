import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';

export const updateLeadInputSchema = z
	.object({
		id: z.string(),
		status: z.nativeEnum(LeadStatus),
		statusReason: z.string().optional(),
		paymentStatus: z.enum(['paid', 'unpaid']).default('unpaid').optional(),
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
