'use client';

type CurrentUserInformation = {
	currentUser: {
		name: string;
		role: string;
	};
};

export function saveCurrentLoggedInUserInformation(name: string, role: string) {
	if (typeof window === 'undefined') {
		return;
	}

	const userInformation: CurrentUserInformation = {
		currentUser: { name, role },
	};

	localStorage.setItem(
		'currentUserInformation',
		JSON.stringify(userInformation),
	);
}

export function getCurrentLoggedInUserInformation() {
	if (typeof window === 'undefined') {
		return null;
	}

	const storedUserInformation = localStorage.getItem('currentUserInformation');

	if (!storedUserInformation) {
		return null;
	}

	try {
		const parsedInformation = JSON.parse(
			storedUserInformation,
		) as CurrentUserInformation;
		return parsedInformation;
	} catch {
		return null;
	}
}
