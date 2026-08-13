'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DurationPreset } from '../lead-list.hook';

const DURATION_OPTIONS: DurationPreset[] = [
	'Today',
	'Yesterday',
	'Week to Date',
	'Last 7 Days',
	'Last 30 Days',
	'This Month',
	'Last Month',
	'All',
	'Custom Range',
];

type DurationFilterProps = {
	value: DurationPreset;
	customDateRange: {
		start: Date;
		end?: Date;
	} | null;
	onDurationChange: (value: DurationPreset) => void;
	onCustomDateRangeChange: (
		value: { start: Date; end?: Date } | null,
	) => void;
};

function getTriggerLabel(
	value: DurationPreset,
	customDateRange: DurationFilterProps['customDateRange'],
) {
	if (value !== 'Custom Range') return value === 'All' ? 'Select Duration' : value;
	if (!customDateRange?.start) return 'Custom Range';

	const start = format(customDateRange.start, 'MM/dd/yyyy');
	const end = customDateRange.end
		? format(customDateRange.end, 'MM/dd/yyyy')
		: start;

	return `${start} - ${end}`;
}

export function DurationFilter({
	value,
	customDateRange,
	onDurationChange,
	onCustomDateRangeChange,
}: DurationFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [draftRange, setDraftRange] = useState<DateRange | undefined>();
	const triggerLabel = getTriggerLabel(value, customDateRange);

	const appliedRange = useMemo<DateRange | undefined>(
		() =>
			customDateRange
				? { from: customDateRange.start, to: customDateRange.end }
				: undefined,
		[customDateRange],
	);
	const selectedRange = draftRange || appliedRange;

	const displayedMonth = useMemo(
		() => selectedRange?.from,
		[selectedRange?.from],
	);

	function handleOpenChange(nextOpen: boolean) {
		setIsOpen(nextOpen);
		if (!nextOpen) setDraftRange(undefined);
	}

	function selectDuration(duration: DurationPreset) {
		onDurationChange(duration);

		if (duration !== 'Custom Range') {
			onCustomDateRangeChange(null);
			handleOpenChange(false);
		}
	}

	function applyCustomRange() {
		if (!selectedRange?.from) return;

		onDurationChange('Custom Range');
		onCustomDateRangeChange({
			start: selectedRange.from,
			end: selectedRange.to || selectedRange.from,
		});
		handleOpenChange(false);
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="h-[48px] w-full justify-between rounded-[12px] border-[#D4D7E3] bg-white px-4 text-left text-[14px] font-normal text-[#26395C] hover:bg-white lg:w-[214px]"
				>
					<span className="truncate text-[#8897AD]">
						{triggerLabel || 'Select Duration'}
					</span>
					<CalendarIcon className="size-4 shrink-0 text-[#8897AD]" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-[calc(100vw-48px)] max-w-[660px] overflow-hidden rounded-[12px] border-none bg-white p-0 shadow-xl lg:w-[660px]"
			>
				<div className="flex flex-col lg:flex-row">
					<div className="grid bg-[#F5F7FC] p-3 lg:w-[145px] lg:shrink-0 lg:content-start">
						{DURATION_OPTIONS.map((duration) => (
							<button
								key={duration}
								type="button"
								onClick={() => selectDuration(duration)}
								className={cn(
									'rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#26395C] transition-colors hover:bg-white',
									value === duration && 'bg-white text-[#2563EB]',
								)}
							>
								{duration}
							</button>
						))}
					</div>

					<div className="min-w-0 flex-1 p-3">
						<Calendar
							mode="range"
							defaultMonth={displayedMonth}
							selected={selectedRange}
							onSelect={(range) => {
								setDraftRange(range);
							}}
							numberOfMonths={2}
							className="mx-auto"
						/>

						<div className="mt-3 flex flex-col gap-3 border-t border-[#E5E7EB] pt-3 text-[12px] text-[#8897AD] sm:flex-row sm:items-center sm:justify-end">
							<span className="text-center sm:mr-auto sm:text-left">
								{selectedRange?.from
									? `${format(selectedRange.from, 'MM/dd/yyyy')} - ${format(
											selectedRange.to || selectedRange.from,
											'MM/dd/yyyy',
										)}`
									: 'Select a custom date range'}
							</span>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
								className="h-[36px] rounded-[8px] border-[#D4D7E3] px-6 text-[#26395C]"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={applyCustomRange}
								disabled={!selectedRange?.from}
								className="h-[36px] rounded-[8px] bg-[#2563EB] px-6 text-white hover:bg-[#2563EB]/90"
							>
								Apply Range
							</Button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}


