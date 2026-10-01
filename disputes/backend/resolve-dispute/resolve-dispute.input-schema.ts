import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';

export const resolveDisputeInputSchema = z.object({
	id: z.string().min(1, 'Dispute is required'),
	decision: z.enum([LeadStatus.BILLABLE, LeadStatus.NON_BILLABLE]),
	decisionNotes: z.string().trim().min(1, 'Decision notes are required'),
});

export type ResolveDisputeInput = z.infer<typeof resolveDisputeInputSchema>;
