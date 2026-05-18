import Sidebar from '@/common/components/sidebar';
import Header from '@/common/components/header';

export default function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen w-full bg-[#E5F0FF]">
			{/* Sidebar - Desktop: 20% width */}
			<Sidebar />

			{/* Main Content Area - Desktop: 80% width (or flex-1 with sidebar offset) */}
			<div className="flex flex-1 flex-col lg:ml-[20%]">
				<Header />
				<main className="flex-1 px-6 pb-10 lg:px-[50px]">{children}</main>
			</div>
		</div>
	);
}
