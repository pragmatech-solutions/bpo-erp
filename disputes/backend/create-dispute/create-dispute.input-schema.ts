import { z } from 'zod';

export const createDisputeInputSchema = z.object({
	leadId: z.string().min(1, 'Lead is required'),
	recordingLink: z
		.string()
		.trim()
		.url('Recording link must be a valid URL')
		.optional()
		.or(z.literal('').transform(() => undefined)),
	qaNotes: z.string().trim().min(1, 'QA notes are required'),
});

export type CreateDisputeInput = z.infer<typeof createDisputeInputSchema>;
