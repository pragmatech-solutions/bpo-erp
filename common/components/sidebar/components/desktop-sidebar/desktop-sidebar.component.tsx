'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
	NAVIGATION_LINKS,
	BOTTOM_NAVIGATION_OPTIONS,
} from '@/common/constants/navigation';
import { cn } from '@/lib/utils';
import { removeToken } from '@/lib/api-client';

export function DesktopSidebar() {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = () => {
		removeToken();
		router.push('/login');
	};

	return (
		<aside className="fixed left-0 top-0 z-40 hidden h-screen w-[20%] flex-col bg-[#FEFEFE] lg:flex">
			<div className="flex h-[145px] items-center justify-center">
				<Image
					src="/logo.png"
					alt="Mavrix Logo"
					width={70}
					height={70}
					priority
				/>
			</div>

			<nav className="flex flex-1 flex-col gap-4 pr-0">
				{NAVIGATION_LINKS.map((link) => {
					const isActive = pathname === link.href;
					return (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'flex h-[67px] items-center gap-5 pl-[47px] text-[18px] font-medium transition-colors',
								isActive
									? 'rounded-r-[33.5px] bg-[#E5F0FF] text-[#26395C]'
									: 'text-[#26395C] hover:bg-gray-50',
							)}
						>
							<link.icon className="size-6" />
							<span>{link.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="mb-[80px] flex flex-col gap-4">
				{BOTTOM_NAVIGATION_OPTIONS.map((option) => {
					const className =
						'flex h-[21px] items-center gap-5 pl-[47px] text-[18px] font-medium text-[#26395C] transition-colors hover:text-blue-600';

					if (option.label === 'Logout') {
						return (
							<button
								key={option.label}
								onClick={handleLogout}
								className={className}
							>
								<option.icon className="size-5" />
								<span>{option.label}</span>
							</button>
						);
					}

					return (
						<Link key={option.href} href={option.href!} className={className}>
							<option.icon className="size-5" />
							<span>{option.label}</span>
						</Link>
					);
				})}
			</div>
		</aside>
	);
}
