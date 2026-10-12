import type {
	SubmitInsellerateLeadInput,
	SubmitInsellerateLeadResult,
} from './submit-insellerate-lead.type';

const INSELLERATE_PORTAL_URL = 'https://socialupmedia.dev/Mortgage_Form/';
const REQUEST_TIMEOUT_MS = 30000;
const SUCCESS_MARKER = 'Lead Submitted Successfully';

const BROWSER_HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (X11; Linux x86_64; rv:157.0) Gecko/20100101 Firefox/157.0',
	Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Language': 'en-US,en;q=0.9',
	'Content-Type': 'application/x-www-form-urlencoded',
	Origin: 'https://socialupmedia.dev',
	'Sec-GPC': '1',
	Referer: 'https://socialupmedia.dev/Mortgage_Form/',
	'Upgrade-Insecure-Requests': '1',
	'Sec-Fetch-Dest': 'document',
	'Sec-Fetch-Mode': 'navigate',
	'Sec-Fetch-Site': 'same-origin',
	'Sec-Fetch-User': '?1',
	Priority: 'u=0, i',
};

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

function logForwardedFields(html: string) {
	const section = html.split('JSON Sent')[1];
	if (!section) {
		console.warn('Insellerate portal: could not read the forwarded JSON');
		return;
	}

	const decoded = section.replace(/&quot;/g, '"');
	const fields = [
		...decoded.matchAll(/"([A-Za-z0-9_]+)"\s*:\s*(null|""|[^,\n]+)/g),
	].map(
		([, name, value]) =>
			`${name}:${value === 'null' || value === '""' ? 'empty' : 'set'}`,
	);
	console.info(`Insellerate portal forwarded: ${fields.join(', ')}`);
}

export async function submitInsellerateLead(
	input: SubmitInsellerateLeadInput,
): Promise<SubmitInsellerateLeadResult> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(INSELLERATE_PORTAL_URL, {
			method: 'POST',
			headers: BROWSER_HEADERS,
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

		logForwardedFields(html);

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
