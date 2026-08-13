import type { DurationPreset } from './lead-list.hook';

export type LeadDateRange = {
	startDate?: Date;
	endDate?: Date;
};

export type CustomDateRange = {
	start: Date;
	end?: Date;
} | null;

export function resolveDurationRange(
	duration: DurationPreset,
	customDateRange: CustomDateRange,
): LeadDateRange {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const endOfToday = new Date(today);
	endOfToday.setHours(23, 59, 59, 999);

	switch (duration) {
		case 'Today':
			return { startDate: today };
		case 'Yesterday': {
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 1);
			return { startDate, endDate: today };
		}
		case 'Last 7 Days': {
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 7);
			return { startDate };
		}
		case 'Week to Date': {
			const dayOfWeek = today.getDay();
			const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - daysSinceMonday);
			return { startDate, endDate: endOfToday };
		}
		case 'Last 30 Days': {
			const startDate = new Date(today);
			startDate.setDate(startDate.getDate() - 30);
			return { startDate };
		}
		case 'This Month':
			return { startDate: new Date(now.getFullYear(), now.getMonth(), 1) };
		case 'Last Month':
			return {
				startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
				endDate: new Date(now.getFullYear(), now.getMonth(), 0),
			};
		case 'Custom Range':
			if (!customDateRange) return {};
			return {
				startDate: customDateRange.start,
				endDate: customDateRange.end,
			};
		default:
			return {};
	}
}
