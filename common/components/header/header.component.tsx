'use client';

import { Menu, Moon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MobileSidebar } from '@/common/components/sidebar';
import { useHeaderHook } from './header.hook';

export function Header() {
	const { isSidebarOpen, toggleSidebar, closeSidebar } = useHeaderHook();

	return (
		<>
			<header className="flex h-[100px] w-full items-center justify-between px-6 lg:h-[120px] lg:justify-end lg:px-[50px]">
				{/* Mobile Left: Menu Toggle */}
				<div className="lg:hidden">
					<Button
						variant="ghost"
						size="icon"
						className="text-[#091F5B]"
						onClick={toggleSidebar}
					>
						<Menu className="size-[39px]" />
					</Button>
				</div>

				{/* Mobile Center: Logo */}
				<div className="lg:hidden">
					<Image src="/next.svg" alt="Logo" width={58} height={58} />
				</div>

				{/* Desktop & Mobile Right: Theme & Profile */}
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" className="text-[#26395C]">
						<Moon className="size-[26px]" />
					</Button>

					<div className="flex size-[49px] items-center justify-center rounded-full bg-[#D9D9D9] lg:bg-transparent">
						<Image
							src="/vercel.svg"
							alt="Profile"
							width={49}
							height={49}
							className="rounded-full"
						/>
					</div>
				</div>
			</header>

			{/* Mobile Sidebar Component */}
			<MobileSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
		</>
	);
}
