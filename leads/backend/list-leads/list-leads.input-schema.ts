import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';

export const listLeadsInputSchema = z.object({
	limit: z.number().int().positive().max(100).default(5),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	status: z.nativeEnum(LeadStatus).optional(),
	search: z.string().optional(),
	campaign: z.string().optional(),
	agentId: z.string().optional(),
});
