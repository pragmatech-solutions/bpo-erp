import { z } from 'zod';

export const updateLoanOfficerNotesInputSchema = z.object({
	id: z.string().min(1, 'Dispute is required'),
	loanOfficerNotes: z.string().trim().min(1, 'Loan officer notes are required'),
});

export type UpdateLoanOfficerNotesInput = z.infer<
	typeof updateLoanOfficerNotesInputSchema
>;
