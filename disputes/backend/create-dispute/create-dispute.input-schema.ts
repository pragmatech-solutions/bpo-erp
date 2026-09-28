import { z } from 'zod';

export const createDisputeInputSchema = z.object({
	leadId: z.string().min(1, 'Lead is required'),
});

export type CreateDisputeInput = z.infer<typeof createDisputeInputSchema>;