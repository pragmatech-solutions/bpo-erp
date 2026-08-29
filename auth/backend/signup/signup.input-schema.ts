import { z } from 'zod';

export const signupInputSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	username: z.string().trim().min(3, 'Username must be at least 3 characters'),
	email: z
		.string()
		.trim()
		.email('Invalid email address')
		.optional()
		.or(z.literal(''))
		.transform((value) => (value ? value : undefined)),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number')
		.regex(
			/[^A-Za-z0-9]/,
			'Password must contain at least one special character',
		),
	phone_number: z
		.string()
		.trim()
		.regex(/^[0-9\s()+-]+$/, 'Invalid phone number format')
		.optional()
		.or(z.literal('')),
});

export type SignupInput = z.infer<typeof signupInputSchema>;
