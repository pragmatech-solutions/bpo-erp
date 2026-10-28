import Link from 'next/link';
import { ChevronRight, FilePenLine } from 'lucide-react';

export function PortalSettings() {
	return (
		<div className="flex flex-col gap-8 py-6 lg:py-10">
			<h1 className="font-[var(--font-poppins)] text-[28px] font-semibold text-[#0C1421] lg:text-[32px]">
				Portal Settings
			</h1>

			<section className="overflow-hidden rounded-[12px] border border-[#D4D7E3] bg-white shadow-sm">
				<Link
					href="/portal-settings/call-transfer-sheet"
					className="flex items-center justify-between gap-4 px-5 py-5 text-[#0C1421] transition-colors hover:bg-[#F8FBFF] lg:px-6"
				>
					<span className="flex min-w-0 items-center gap-4">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[#E5F0FF] text-[#2563EB]">
							<FilePenLine className="size-5" />
						</span>
						<span className="truncate text-[16px] font-medium">
							Update Call Transfer Sheet
						</span>
					</span>
					<ChevronRight className="size-5 shrink-0 text-[#6B7A99]" />
				</Link>
			</section>
		</div>
	);
}
