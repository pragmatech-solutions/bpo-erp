'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import {
	NAVIGATION_LINKS,
	BOTTOM_NAVIGATION_LINKS,
} from '@/common/constants/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MobileSidebar({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const pathname = usePathname();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose}>
			<aside
				className="flex h-full w-[80%] flex-col bg-[#FEFEFE] shadow-xl animate-in slide-in-from-left duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 py-8">
					<Image src="/logo.png" alt="Mavrix Logo" width={60} height={60} />
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="size-6 text-[#26395C]" />
					</Button>
				</div>

				<nav className="flex flex-1 flex-col gap-4">
					{NAVIGATION_LINKS.map((link) => {
						const isActive = pathname === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={onClose}
								className={cn(
									'flex h-[60px] items-center gap-5 pl-8 text-[16px] font-medium transition-colors',
									isActive
										? 'bg-[#E5F0FF] text-[#26395C]'
										: 'text-[#26395C] hover:bg-gray-50',
								)}
							>
								<link.icon className="size-5" />
								<span>{link.label}</span>
							</Link>
						);
					})}
				</nav>

				<div className="mb-10 flex flex-col gap-4">
					{BOTTOM_NAVIGATION_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={onClose}
							className="flex h-[20px] items-center gap-5 pl-8 text-[16px] font-medium text-[#26395C] transition-colors hover:text-blue-600"
						>
							<link.icon className="size-5" />
							<span>{link.label}</span>
						</Link>
					))}
				</div>
			</aside>
		</div>
	);
}
