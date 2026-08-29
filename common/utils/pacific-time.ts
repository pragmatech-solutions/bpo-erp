const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

type PacificDateParts = {
	year: number;
	month: number;
	day: number;
	weekday: string;
};

const pacificDateFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: PACIFIC_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	weekday: 'short',
});

const pacificDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: PACIFIC_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hourCycle: 'h23',
});

function getFormatterPart(parts: Intl.DateTimeFormatPart[], type: string) {
	const part = parts.find((item) => item.type === type)?.value;
	if (!part) throw new Error(`Missing ${type} date part`);

	return part;
}

function getPacificDateParts(date: Date): PacificDateParts {
	const parts = pacificDateFormatter.formatToParts(date);

	return {
		year: Number(getFormatterPart(parts, 'year')),
		month: Number(getFormatterPart(parts, 'month')),
		day: Number(getFormatterPart(parts, 'day')),
		weekday: getFormatterPart(parts, 'weekday'),
	};
}

function getPacificOffsetMs(date: Date) {
	const parts = pacificDateTimeFormatter.formatToParts(date);
	const pacificTimeAsUtc = Date.UTC(
		Number(getFormatterPart(parts, 'year')),
		Number(getFormatterPart(parts, 'month')) - 1,
		Number(getFormatterPart(parts, 'day')),
		Number(getFormatterPart(parts, 'hour')),
		Number(getFormatterPart(parts, 'minute')),
		Number(getFormatterPart(parts, 'second')),
		date.getUTCMilliseconds(),
	);

	return pacificTimeAsUtc - date.getTime();
}

function getUtcDateForPacificTime(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number,
) {
	const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
	const firstOffset = getPacificOffsetMs(new Date(utcGuess));
	const firstResult = utcGuess - firstOffset;
	const secondOffset = getPacificOffsetMs(new Date(firstResult));

	return new Date(utcGuess - secondOffset);
}

function addCalendarDays(parts: PacificDateParts, days: number) {
	const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));

	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		weekday: parts.weekday,
	};
}

function getStartOfPacificDay(parts: Pick<PacificDateParts, 'year' | 'month' | 'day'>) {
	return getUtcDateForPacificTime(parts.year, parts.month, parts.day, 0, 0, 0, 0);
}

function getEndOfPacificDay(parts: Pick<PacificDateParts, 'year' | 'month' | 'day'>) {
	return getUtcDateForPacificTime(parts.year, parts.month, parts.day, 23, 59, 59, 999);
}

function getDaysSinceMonday(weekday: string) {
	const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const index = weekdays.indexOf(weekday);

	return index === -1 ? 0 : index;
}

export function getPacificDateRangeForPreset(
	preset:
		| 'Today'
		| 'Yesterday'
		| 'Week to Date'
		| 'Last 7 Days'
		| 'Last 30 Days'
		| 'This Month'
		| 'Last Month',
	now = new Date(),
) {
	const today = getPacificDateParts(now);
	let startParts = today;
	let endParts = today;

	switch (preset) {
		case 'Yesterday':
			startParts = addCalendarDays(today, -1);
			endParts = startParts;
			break;
		case 'Week to Date':
			startParts = addCalendarDays(today, -getDaysSinceMonday(today.weekday));
			break;
		case 'Last 7 Days':
			startParts = addCalendarDays(today, -7);
			break;
		case 'Last 30 Days':
			startParts = addCalendarDays(today, -30);
			break;
		case 'This Month':
			startParts = { ...today, day: 1 };
			break;
		case 'Last Month': {
			const firstOfThisMonth = new Date(Date.UTC(today.year, today.month - 1, 1));
			const firstOfLastMonth = new Date(
				Date.UTC(firstOfThisMonth.getUTCFullYear(), firstOfThisMonth.getUTCMonth() - 1, 1),
			);
			const lastOfLastMonth = new Date(
				Date.UTC(firstOfThisMonth.getUTCFullYear(), firstOfThisMonth.getUTCMonth(), 0),
			);

			startParts = {
				year: firstOfLastMonth.getUTCFullYear(),
				month: firstOfLastMonth.getUTCMonth() + 1,
				day: firstOfLastMonth.getUTCDate(),
				weekday: today.weekday,
			};
			endParts = {
				year: lastOfLastMonth.getUTCFullYear(),
				month: lastOfLastMonth.getUTCMonth() + 1,
				day: lastOfLastMonth.getUTCDate(),
				weekday: today.weekday,
			};
			break;
		}
		case 'Today':
		default:
			break;
	}

	return {
		startDate: getStartOfPacificDay(startParts),
		endDate: getEndOfPacificDay(endParts),
	};
}

export function getPacificDateRangeFromCalendarDates(start: Date, end = start) {
	const startParts = {
		year: start.getFullYear(),
		month: start.getMonth() + 1,
		day: start.getDate(),
	};
	const endParts = {
		year: end.getFullYear(),
		month: end.getMonth() + 1,
		day: end.getDate(),
	};

	return {
		startDate: getStartOfPacificDay(startParts),
		endDate: getEndOfPacificDay(endParts),
	};
}

export function formatDateInPacificTime(value: string | Date) {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: PACIFIC_TIME_ZONE,
	}).format(new Date(value));
}
