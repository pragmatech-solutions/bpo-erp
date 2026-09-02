import { z } from 'zod';

export const bulkLeadActionSchema = z.enum([
	'mark_paid',
	'mark_unpaid',
	'mark_deleted',
]);

export const bulkUpdateLeadsInputSchema = z.object({
	leadIds: z
		.array(z.string().trim().min(1, 'Lead id is required'))
		.min(1, 'Select at least one lead')
		.max(200, 'You can update up to 200 leads at once'),
	action: bulkLeadActionSchema,
});

export type BulkLeadAction = z.infer<typeof bulkLeadActionSchema>;
export type BulkUpdateLeadsInput = z.input<typeof bulkUpdateLeadsInputSchema>;
