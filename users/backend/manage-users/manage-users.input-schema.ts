import { z } from 'zod';
import { UserRole } from '@/common/constants/user-roles.enum';
import { UserAvailabilityStatus } from '@/common/constants/user-availability-status.enum';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/common/constants/pagination';

export const userStatusSchema = z.enum(['active', 'inactive', 'blocked']);

export const listUsersInputSchema = z.object({
	role: z.nativeEnum(UserRole).or(z.literal('all')).default('all'),
	status: userStatusSchema.or(z.literal('all')).default('all'),
	teamId: z.string().optional(),
	withoutTeam: z.boolean().optional(),
	createdBy: z.string().optional(),
	search: z.string().optional(),
	page: z.number().int().positive().default(DEFAULT_PAGE),
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_PAGE_SIZE)
		.default(DEFAULT_PAGE_SIZE),
});

export const createUserInputSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	username: z.string().trim().min(3, 'Username must be at least 3 characters'),
	email: z
		.string()
		.trim()
		.email('Valid email is required')
		.optional()
		.or(z.literal(''))
		.transform((value) => (value ? value : undefined)),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	role: z.nativeEnum(UserRole),
	status: userStatusSchema.default('inactive'),
	teamId: z.string().nullable().optional(),
});

export const updateUserInputSchema = z.object({
	id: z.string().min(1),
	role: z.nativeEnum(UserRole).optional(),
	status: userStatusSchema.optional(),
	availabilityStatus: z.nativeEnum(UserAvailabilityStatus).optional(),
	teamId: z.string().nullable().optional(),
});

export type ListUsersInput = z.input<typeof listUsersInputSchema>;
export type CreateUserInput = z.input<typeof createUserInputSchema>;
export type UpdateUserInput = z.input<typeof updateUserInputSchema>;
