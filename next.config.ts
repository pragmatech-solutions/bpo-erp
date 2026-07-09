import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const nextConfig: NextConfig = {
	async redirects() {
		return [
			{
				source: '/',
				destination: '/dashboard',
				permanent: true,
			},
		];
	},
};

const isDev = process.env.NODE_ENV === 'development';

const withSerwist = withSerwistInit({
	swSrc: 'app/sw.ts',
	swDest: 'public/sw.js',
	disable: isDev,
});

export default isDev ? nextConfig : withSerwist(nextConfig);
