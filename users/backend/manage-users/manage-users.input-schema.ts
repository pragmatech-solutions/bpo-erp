import { z } from 'zod';
import { UserRole } from '@/common/constants/user-roles.enum';

export const userStatusSchema = z.enum(['active', 'inactive', 'blocked']);

export const listUsersInputSchema = z.object({
	role: z.nativeEnum(UserRole).or(z.literal('all')).default('all'),
	status: userStatusSchema.or(z.literal('all')).default('all'),
	teamId: z.string().optional(),
	withoutTeam: z.boolean().optional(),
	createdBy: z.string().optional(),
	search: z.string().optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(50).default(6),
});

export const createUserInputSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	username: z.string().trim().min(3, 'Username must be at least 3 characters'),
	email: z.string().trim().email('Valid email is required'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	role: z.nativeEnum(UserRole),
	status: userStatusSchema.default('inactive'),
	teamId: z.string().nullable().optional(),
});

export const updateUserInputSchema = z.object({
	id: z.string().min(1),
	role: z.nativeEnum(UserRole).optional(),
	status: userStatusSchema.optional(),
	teamId: z.string().nullable().optional(),
});

export type ListUsersInput = z.input<typeof listUsersInputSchema>;
export type CreateUserInput = z.input<typeof createUserInputSchema>;
export type UpdateUserInput = z.input<typeof updateUserInputSchema>;
