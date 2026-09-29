import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';

export const resolveDisputeInputSchema = z.object({
	id: z.string().min(1, 'Dispute is required'),
	decision: z.enum([LeadStatus.BILLABLE, LeadStatus.NON_BILLABLE]),
	decisionNotes: z.string().trim().optional(),
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeInputSchema>;