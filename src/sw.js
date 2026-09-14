import { defaultCache } from "@serwist/next/worker"
import { CacheFirst, NetworkFirst, Serwist } from "serwist"

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [
		{
			matcher: ({ request }) => request.mode === "navigate",
			handler: new NetworkFirst({
				cacheName: "excalith-pages",
				networkTimeoutSeconds: 3
			})
		},
		{
			matcher: ({ request, url }) =>
				request.destination === "image" || url.pathname.startsWith("/api/getData"),
			handler: new CacheFirst({ cacheName: "excalith-assets" })
		},
		...defaultCache
	]
})

serwist.addEventListeners()
