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
