import { z } from 'zod';

export const listLeadsInputSchema = z.object({
	limit: z.number().int().positive().max(50).default(5),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});
