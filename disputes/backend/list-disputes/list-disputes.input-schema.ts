import { z } from 'zod';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/common/constants/pagination';
import { DisputeStatus } from '@/common/constants/dispute-status.enum';

export const listDisputesInputSchema = z.object({
	page: z.number().int().positive().default(DEFAULT_PAGE),
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_PAGE_SIZE)
		.default(DEFAULT_PAGE_SIZE),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	status: z.nativeEnum(DisputeStatus).optional(),
	createdById: z.string().optional(),
	search: z.string().optional(),	id: z.string().optional(),
});

export type ListDisputesInput = z.infer<typeof listDisputesInputSchema>;
