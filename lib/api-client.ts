import Cookies from 'js-cookie';

const ACCESS_TOKEN_COOKIE_NAME = 'token';
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const ACCESS_TOKEN_MAX_AGE_DAYS = 1 / 48; // 30 minutes
const REFRESH_TOKEN_MAX_AGE_DAYS = 7;

type ApiErrorResponse = {
	message?: string;
	error?: string;
};

type RefreshResponse = {
	success: boolean;
	token?: string;
	error?: string;
};

let refreshRequest: Promise<string | null> | null = null;

async function parseJsonResponse(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

function getApiErrorMessage(data: unknown) {
	if (typeof data === 'object' && data !== null) {
		const errorData = data as ApiErrorResponse;
		return errorData.message || errorData.error;
	}

	return undefined;
}

function buildHeaders(options: RequestInit) {
	const token = Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
	const headers = {
		'Content-Type': 'application/json',
		...options.headers,
	} as Record<string, string>;

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	return headers;
}

async function refreshAccessToken() {
	if (!Cookies.get(REFRESH_TOKEN_COOKIE_NAME)) {
		return null;
	}

	if (!refreshRequest) {
		refreshRequest = fetch('/refresh/api', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		})
			.then(async (response) => {
				const data = (await parseJsonResponse(response)) as RefreshResponse | null;

				if (!response.ok || !data?.success || !data.token) {
					removeToken();
					return null;
				}

				setToken(data.token);
				return data.token;
			})
			.finally(() => {
				refreshRequest = null;
			});
	}

	return refreshRequest;
}

async function sendRequest(url: string, options: RequestInit) {
	return fetch(url, {
		...options,
		headers: buildHeaders(options),
	});
}

export async function apiClient<T>(
	url: string,
	options: RequestInit = {},
): Promise<T> {
	let response = await sendRequest(url, options);
	let data = await parseJsonResponse(response);

	const canAttemptRefresh =
		response.status === 401 &&
		url !== '/login/api' &&
		url !== '/signup/api' &&
		url !== '/refresh/api';

	if (canAttemptRefresh) {
		const refreshedToken = await refreshAccessToken();

		if (refreshedToken) {
			response = await sendRequest(url, options);
			data = await parseJsonResponse(response);
		}
	}

	if (!response.ok) {
		throw new Error(getApiErrorMessage(data) || 'API request failed');
	}

	return data as T;
}

export function setToken(token: string) {
	Cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, {
		expires: ACCESS_TOKEN_MAX_AGE_DAYS,
		path: '/',
	});
}

export function setAuthTokens(token: string, refreshToken: string) {
	setToken(token);
	Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
		expires: REFRESH_TOKEN_MAX_AGE_DAYS,
		path: '/',
	});
}

export function removeToken() {
	Cookies.remove(ACCESS_TOKEN_COOKIE_NAME, { path: '/' });
	Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
}
