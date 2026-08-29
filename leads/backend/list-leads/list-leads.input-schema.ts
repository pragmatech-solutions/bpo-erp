import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/common/constants/pagination';

export const listLeadsInputSchema = z.object({
	page: z.number().int().positive().default(DEFAULT_PAGE),
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_PAGE_SIZE)
		.default(DEFAULT_PAGE_SIZE),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	status: z.nativeEnum(LeadStatus).optional(),
	paymentStatus: z.enum(['paid', 'unpaid']).optional(),
	search: z.string().optional(),
	campaign: z.string().optional(),
	agentId: z.string().optional(),
	teamId: z.string().optional(),
	deletedFilter: z.enum(['active', 'deleted', 'all']).default('active'),
});
