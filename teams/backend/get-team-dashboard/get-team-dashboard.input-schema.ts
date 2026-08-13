import { z } from 'zod';
import { LeadStatus } from '@/common/constants/lead-status.enum';
import { MAX_PAGE_SIZE } from '@/common/constants/pagination';

export const getTeamDashboardInputSchema = z.object({
	// The team dashboard shows an unpaginated lead feed, so it keeps its own
	// default while sharing the global cap.
	limit: z.number().int().positive().max(MAX_PAGE_SIZE).default(20),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	status: z.nativeEnum(LeadStatus).optional(),
	paymentStatus: z.enum(['paid', 'unpaid']).optional(),
	search: z.string().optional(),
	campaign: z.string().optional(),
	agentId: z.string().optional(),
});

export type GetTeamDashboardInput = {
	limit?: number;
	startDate?: Date;
	endDate?: Date;
	status?: LeadStatus;
	paymentStatus?: 'paid' | 'unpaid';
	search?: string;
	campaign?: string;
	agentId?: string;
};

export type GetTeamDashboardValidatedInput = z.infer<
	typeof getTeamDashboardInputSchema
>;
