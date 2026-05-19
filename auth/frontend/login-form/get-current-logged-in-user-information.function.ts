'use client';

type CurrentUserInformation = {
	currentUser: {
		name: string;
	};
};

export function saveCurrentLoggedInUserInformation(name: string) {
	if (typeof window === 'undefined') {
		return;
	}

	const userInformation: CurrentUserInformation = {
		currentUser: { name },
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
