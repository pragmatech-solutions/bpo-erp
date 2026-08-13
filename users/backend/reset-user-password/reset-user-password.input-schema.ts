import { z } from 'zod';

export const resetUserPasswordInputSchema = z.object({
	id: z.string().min(1),
});

export type ResetUserPasswordInput = z.infer<
	typeof resetUserPasswordInputSchema
>;
