import { z } from 'zod';

export const updateAccountInputSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters'),
	email: z
		.string()
		.trim()
		.email('Invalid email address')
		.optional()
		.or(z.literal(''))
		.transform((value) => (value ? value.toLowerCase() : undefined)),
	phoneNumber: z
		.string()
		.trim()
		.regex(/^[0-9\s()+-]+$/, 'Invalid phone number format')
		.optional()
		.or(z.literal(''))
		.transform((value) => (value ? value : undefined)),
	currentPassword: z.string().min(1, 'Old password is required'),
	newPassword: z
		.string()
		.min(8, 'New password must be at least 8 characters')
		.regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'New password must contain at least one number')
		.regex(
			/[^A-Za-z0-9]/,
			'New password must contain at least one special character',
		),
});

export type UpdateAccountInput = z.input<typeof updateAccountInputSchema>;
