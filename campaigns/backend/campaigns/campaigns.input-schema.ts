import { z } from 'zod';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/common/constants/pagination';

export const listCampaignsInputSchema = z.object({
	status: z.enum(['all', 'active', 'disabled']).default('all'),
	search: z.string().optional(),
	page: z.number().int().positive().default(DEFAULT_PAGE),
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_PAGE_SIZE)
		.default(DEFAULT_PAGE_SIZE),
});

export const createCampaignInputSchema = z.object({
	name: z.string().trim().min(1, 'Campaign name is required'),
	isActive: z.boolean().default(true),
});

export const updateCampaignInputSchema = z.object({
	id: z.string().min(1),
	name: z.string().trim().min(1, 'Campaign name is required').optional(),
	isActive: z.boolean().optional(),
});

export type ListCampaignsInput = z.input<typeof listCampaignsInputSchema>;
export type CreateCampaignInput = z.input<typeof createCampaignInputSchema>;
export type UpdateCampaignInput = z.input<typeof updateCampaignInputSchema>;
