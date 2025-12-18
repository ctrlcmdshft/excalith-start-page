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
 * Check if authenticated in current session
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
	if (typeof window === "undefined") return false
	return sessionStorage.getItem("authenticated") === "true"
}

/**
 * Set authentication status in session
 * @param {boolean} status - Authentication status
 */
export function setAuthenticated(status) {
	if (typeof window === "undefined") return
	if (status) {
		sessionStorage.setItem("authenticated", "true")
	} else {
		sessionStorage.removeItem("authenticated")
	}
}
