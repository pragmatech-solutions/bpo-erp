import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Inter, Poppins } from 'next/font/google';
import { SerwistProvider } from '@serwist/next/react';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({
	subsets: ['latin'],
	weight: ['400', '600'],
	variable: '--font-poppins',
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Lead Management System - Mavrix Communications',
	description:
		'This is a lead management software, created for Mavrix Communications. It is an internal use for company use',
	manifest: '/manifest.webmanifest',
	icons: {
		icon: [
			{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
		],
		apple: '/icons/apple-touch-icon.png',
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Mavrix',
	},
};

export const viewport: Viewport = {
	themeColor: '#ffffff',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const shouldRegisterServiceWorker = process.env.NODE_ENV === 'production';

	return (
		<html
			lang="en"
			className={cn('font-sans', inter.variable, poppins.variable)}
		>
			<body className={`${geistMono.variable} antialiased`}>
				{shouldRegisterServiceWorker ? (
					<SerwistProvider swUrl="/sw.js" cacheOnNavigation={false}>
						{children}
					</SerwistProvider>
				) : (
					children
				)}
			</body>
		</html>
	);
}
