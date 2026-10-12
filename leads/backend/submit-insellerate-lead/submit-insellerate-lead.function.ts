import type {
	SubmitInsellerateLeadInput,
	SubmitInsellerateLeadResult,
} from './submit-insellerate-lead.type';

const INSELLERATE_PORTAL_URL = 'https://socialupmedia.dev/Mortgage_Form/';
const REQUEST_TIMEOUT_MS = 30000;
const SUCCESS_MARKER = 'Lead Submitted Successfully';

export const INSELLERATE_PORTAL_ERROR =
	'Failed to submit lead to client portal. Contact Admin';

function toFormValue(value: string | number | undefined) {
	return value === undefined ? '' : String(value);
}

function buildFormBody(input: SubmitInsellerateLeadInput) {
	return new URLSearchParams({
		client_campaign: input.client_campaign,
		First_Name: input.first_name,
		Last_Name: input.last_name,
		City_Name: input.city,
		State_Name: input.state,
		Address: toFormValue(input.address),
		Zip_Code: input.zip,
		Email: toFormValue(input.email),
		Mobile: input.mobile,
		Loan1_Amount: toFormValue(input.mortgage_balance),
		Loan1_InitialAmount_Proposed: toFormValue(input.loan_amount),
		FirstLoanRate: toFormValue(input.interest_rate),
		Credit_Score: toFormValue(input.credit_score),
		Veteran: toFormValue(input.veteran),
		loan_type_selection: toFormValue(input.loan_type),
		employment_status_selection: toFormValue(input.employment_status),
	});
}

export async function submitInsellerateLead(
	input: SubmitInsellerateLeadInput,
): Promise<SubmitInsellerateLeadResult> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(INSELLERATE_PORTAL_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: buildFormBody(input),
			signal: controller.signal,
		});
		const html = await response.text();

		if (!response.ok || !html.includes(SUCCESS_MARKER)) {
			console.error(
				`Insellerate portal rejected the lead (HTTP ${response.status})`,
			);
			throw new Error(INSELLERATE_PORTAL_ERROR);
		}

		const prospectId = html.match(/"ProspectId"\s*:\s*(\d+)/)?.[1];

		return { prospectId };
	} catch (error) {
		if (error instanceof Error && error.message === INSELLERATE_PORTAL_ERROR) {
			throw error;
		}

		console.error('Insellerate portal request failed', error);
		throw new Error(INSELLERATE_PORTAL_ERROR);
	} finally {
		clearTimeout(timeout);
	}
}
