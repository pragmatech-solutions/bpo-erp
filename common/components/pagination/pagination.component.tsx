'use client';

import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getPaginationRange } from './pagination.function';

interface PaginationProps {
	page: number;
	totalPages: number;
	total: number;
	limit: number;
	/** Plural noun shown in the summary, e.g. "leads". */
	itemLabel: string;
	onPageChange: (page: number) => void;
	/** When provided, a page-size selector is rendered next to the controls. */
	pageSizeOptions?: number[];
	onPageSizeChange?: (limit: number) => void;
	className?: string;
}

export function Pagination({
	page,
	totalPages,
	total,
	limit,
	itemLabel,
	onPageChange,
	pageSizeOptions,
	onPageSizeChange,
	className,
}: PaginationProps) {
	const { from, to } = getPaginationRange(page, limit, total);
	const canChangePageSize =
		pageSizeOptions !== undefined && onPageSizeChange !== undefined;

	return (
		<div
			className={cn(
				'flex flex-col gap-3 border-t border-[#D4D7E3] bg-white px-4 py-4 text-[#8897AD] lg:flex-row lg:items-center lg:justify-between lg:px-6',
				className,
			)}
		>
			<span>
				Showing {from} to {to} of {total} {itemLabel}
			</span>
			<div className="flex items-center gap-3">
				{canChangePageSize && (
					<Select
						value={String(limit)}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="h-9 w-[110px] rounded-[12px] border-[#D4D7E3] bg-white px-3 text-[#26395C]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="rounded-[19px] border-none shadow-xl">
							{pageSizeOptions.map((pageSizeOption) => (
								<SelectItem key={pageSizeOption} value={String(pageSizeOption)}>
									Show {pageSizeOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.max(1, page - 1))}
						disabled={page === 1}
					>
						&lt;
					</Button>
					<span className="text-[#26395C]">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange(Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
					>
						&gt;
					</Button>
				</div>
			</div>
		</div>
	);
}
