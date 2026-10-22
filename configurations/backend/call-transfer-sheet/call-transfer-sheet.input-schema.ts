import { z } from 'zod';

export const updateCallTransferSheetInputSchema = z.object({
	value: z
		.string()
		.trim()
		.min(1, 'Call transfer sheet content is required')
		.max(50000),
});

export type UpdateCallTransferSheetInput = z.infer<
	typeof updateCallTransferSheetInputSchema
>;
