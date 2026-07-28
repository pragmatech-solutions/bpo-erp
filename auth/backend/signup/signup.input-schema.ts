import { z } from 'zod';
import { UserRole } from '@/common/constants/user-roles.enum';

export const signupInputSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(
			/[^A-Za-z0-9]/,
			'Password must contain at least one special character',
		),
	role: z.enum([UserRole.AGENT]).default(UserRole.AGENT),
	phone_number: z
		.string()
		.trim()
		.regex(/^[0-9\s()+-]+$/, 'Invalid phone number format')
		.optional()
		.or(z.literal('')),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
