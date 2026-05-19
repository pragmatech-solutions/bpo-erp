import Cookies from 'js-cookie';

export async function apiClient<T>(
	url: string,
	options: RequestInit = {},
): Promise<T> {
	const token = Cookies.get('token');

	const headers = {
		'Content-Type': 'application/json',
		...options.headers,
	} as Record<string, string>;

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...options,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || data.error || 'API request failed');
	}

	return data as T;
}

export function setToken(token: string) {
	Cookies.set('token', token, { expires: 1 / 24 }); // 1 hour
}

export function removeToken() {
	Cookies.remove('token');
}
