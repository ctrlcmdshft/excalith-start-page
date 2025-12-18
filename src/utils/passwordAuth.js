/**
 * Password authentication utilities with SHA-256 hashing
 */

/**
 * Hash a password using SHA-256
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hex string of hashed password
 */
export async function hashPassword(password) {
	const encoder = new TextEncoder()
	const data = encoder.encode(password)
	const hashBuffer = await crypto.subtle.digest("SHA-256", data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
	return hashHex
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
	const inputHash = await hashPassword(password)
	return inputHash === hash
}

/**
 * Check if password protection is enabled
 * @returns {Promise<boolean>} True if enabled
 */
export async function isPasswordEnabled() {
	try {
		const response = await fetch("/api/getPasswordConfig")
		const data = await response.json()
		return data.enabled && data.hasPassword
	} catch (error) {
		console.error("Failed to check password status:", error)
		return false
	}
}

/**
 * Check if authenticated with persistent or session storage
 * @returns {boolean} True if authenticated and not expired
 */
export function isAuthenticated() {
	if (typeof window === "undefined") return false

	// Check persistent storage first
	const authData = localStorage.getItem("auth")
	if (authData) {
		try {
			const { authenticated, expiresAt } = JSON.parse(authData)
			const now = Date.now()

			if (authenticated && expiresAt > now) {
				return true
			} else {
				localStorage.removeItem("auth")
			}
		} catch (error) {
			localStorage.removeItem("auth")
		}
	}

	// Fall back to session storage
	return sessionStorage.getItem("authenticated") === "true"
}

/**
 * Set authentication status with optional persistence
 * @param {boolean} status - Authentication status
 * @param {boolean} remember - If true, persist for 30 days. If false, session only.
 */
export function setAuthenticated(status, remember = false) {
	if (typeof window === "undefined") return

	if (status) {
		if (remember) {
			const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
			localStorage.setItem("auth", JSON.stringify({ authenticated: true, expiresAt }))
			sessionStorage.removeItem("authenticated")
		} else {
			sessionStorage.setItem("authenticated", "true")
			localStorage.removeItem("auth")
		}
	} else {
		localStorage.removeItem("auth")
		sessionStorage.removeItem("authenticated")
	}
}
