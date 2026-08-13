import { z } from 'zod';

export const listTeamsInputSchema = z.object({
	search: z.string().optional(),
	status: z.enum(['all', 'active', 'inactive']).default('all'),
	teamLeadId: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(50).default(8),
});

export const createTeamInputSchema = z.object({
	name: z.string().trim().min(1, 'Team name is required'),
	teamLeadIds: z
		.array(z.string().min(1))
		.min(1, 'At least one team lead is required'),
	memberIds: z.array(z.string().min(1)).default([]),
});

export const getTeamPerformanceInputSchema = z.object({
	id: z.string().min(1),
});

export type ListTeamsInput = z.input<typeof listTeamsInputSchema>;
export type CreateTeamInput = z.input<typeof createTeamInputSchema>;
export type GetTeamPerformanceInput = z.input<
	typeof getTeamPerformanceInputSchema
>;
