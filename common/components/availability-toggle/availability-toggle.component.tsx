'use client';

import { cn } from '@/lib/utils';
import { useAvailabilityToggleHook } from './availability-toggle.hook';

export function AvailabilityToggle() {
	const {
		isActive,
		isLoading,
		isUpdating,
		errorMessage,
		toggleAvailability,
	} = useAvailabilityToggleHook();

	return (
		<div className="flex flex-col items-end gap-1">
			<button
				type="button"
				onClick={toggleAvailability}
				disabled={isLoading || isUpdating}
				aria-pressed={isActive}
				className={cn(
					'flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
					isActive
						? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
						: 'border-[#D4D7E3] bg-white text-[#4B5169]',
				)}
			>
				<span
					className={cn(
						'size-2.5 rounded-full',
						isActive ? 'bg-[#10B981]' : 'bg-[#9CA3AF]',
					)}
				/>
				<span>{isActive ? 'Active' : 'Inactive'}</span>
			</button>
			{errorMessage ? (
				<span className="max-w-[180px] text-right text-[11px] text-red-500">
					{errorMessage}
				</span>
			) : null}
		</div>
	);
}