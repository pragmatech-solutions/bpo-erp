export const INSELLERATE_CLIENTS = [
	{ value: 'GL', label: 'GL' },
	{ value: 'AHL', label: 'AHL' },
	{ value: 'GL_WEST', label: 'GL WEST' },
] as const;

export const INSELLERATE_VETERAN_OPTIONS = [
	{ value: '1', label: 'Yes' },
	{ value: '0', label: 'No' },
] as const;

export const INSELLERATE_LOAN_TYPES = [
	{ value: 'VA', label: 'VA' },
	{ value: 'FHA', label: 'FHA' },
	{ value: 'CONVENTIONAL', label: 'Conventional' },
] as const;

export const INSELLERATE_EMPLOYMENT_STATUSES = [
	{ value: 'EMPLOYED', label: 'Employed' },
	{ value: 'SELF_EMPLOYED', label: 'Self Employed' },
	{ value: 'RETIRED', label: 'Retired' },
	{ value: 'UNEMPLOYED', label: 'Unemployed' },
] as const;

export const INSELLERATE_CLIENT_VALUES = INSELLERATE_CLIENTS.map(
	(client) => client.value,
) as [string, ...string[]];
export const INSELLERATE_VETERAN_VALUES = INSELLERATE_VETERAN_OPTIONS.map(
	(option) => option.value,
) as [string, ...string[]];
export const INSELLERATE_LOAN_TYPE_VALUES = INSELLERATE_LOAN_TYPES.map(
	(option) => option.value,
) as [string, ...string[]];
export const INSELLERATE_EMPLOYMENT_STATUS_VALUES =
	INSELLERATE_EMPLOYMENT_STATUSES.map((option) => option.value) as [
		string,
		...string[],
	];
