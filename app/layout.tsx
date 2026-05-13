import type { Metadata } from 'next';
import { Geist_Mono, Inter, Poppins } from 'next/font/google';
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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn('font-sans', inter.variable, poppins.variable)}
		>
			<body className={`${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
