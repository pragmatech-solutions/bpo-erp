import { z } from 'zod';

export const listLeadsInputSchema = z.object({
	limit: z.number().int().positive().max(100).default(5),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	status: z.enum(['billable', 'non billable', 'pending']).optional(),
	search: z.string().optional(),
});
