export const CALL_TRANSFER_LOAN_TYPES = [
	'Conventional',
	'Veteran',
	'FHA',
	'Streamline',
] as const;

export const CALL_TRANSFER_LOAN_PURPOSES = [
	'Rate and Term',
	'Cash Out',
	'Debt Consolidation',
	'Home Improvement',
] as const;

export const CALL_TRANSFER_CREDIT_RATINGS = [
	'Excellent',
	'Good',
	'Fair',
	'Poor',
] as const;

export type CallTransferLoanType = (typeof CALL_TRANSFER_LOAN_TYPES)[number];
export type CallTransferLoanPurpose =
	(typeof CALL_TRANSFER_LOAN_PURPOSES)[number];
export type CallTransferCreditRating =
	(typeof CALL_TRANSFER_CREDIT_RATINGS)[number];