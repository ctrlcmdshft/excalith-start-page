import { isURL } from "@/utils/isURL"

export async function fetchAsset(assetPath) {
	if (!assetPath) {
		// If assetPath is null or undefined, return an empty string
		return ""
	}
	if (isURL(assetPath)) {
		// If it's a URL, return it directly
		return assetPath
	} else {
		// Let the browser load and decode the image directly, without buffering
		// it as JSON/blob data first or retaining an unreleased object URL.
		return `/api/getData?file=${encodeURIComponent(assetPath)}`
	}
}

const WALLPAPER_CACHE = "excalith-wallpapers-v1"

// Return a local object URL when a wallpaper has already been cached. The
// caller can continue using the normal asset URL when Cache Storage is not
// available (for example during server rendering or private browsing).
export async function getCachedAsset(assetPath) {
	if (!assetPath || typeof window === "undefined" || !window.caches) return null

	try {
		const cache = await window.caches.open(WALLPAPER_CACHE)
		const response = await cache.match(assetPath)
		if (!response) return null

		const blob = await response.blob()
		return URL.createObjectURL(blob)
	} catch {
		return null
	}
}

export async function cacheAsset(assetPath) {
	if (!assetPath || typeof window === "undefined" || !window.caches) return

	try {
		const cache = await window.caches.open(WALLPAPER_CACHE)
		if (await cache.match(assetPath)) return

		const response = await fetch(assetPath)
		if (response.ok || response.type === "opaque") {
			await cache.put(assetPath, response.clone())
		}
	} catch {
		// Browser cache support is an optimization; the normal image request
		// remains the fallback when it is unavailable or rejected.
	}
}
