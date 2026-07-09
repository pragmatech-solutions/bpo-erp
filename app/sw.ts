import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, ExpirationPlugin } from 'serwist';

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		{
			matcher: ({ request, url }) =>
				request.destination === 'image' ||
				url.pathname.startsWith('/icons/') ||
				url.pathname === '/logo.png',
			handler: new CacheFirst({
				cacheName: 'images',
				plugins: [
					new ExpirationPlugin({
						maxEntries: 60,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					}),
				],
			}),
		},
		{
			matcher: ({ request }) =>
				request.destination === 'font' ||
				request.destination === 'style' ||
				request.destination === 'script',
			handler: new CacheFirst({
				cacheName: 'static-assets',
				plugins: [
					new ExpirationPlugin({
						maxEntries: 100,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					}),
				],
			}),
		},
	],
});

serwist.addEventListeners();
