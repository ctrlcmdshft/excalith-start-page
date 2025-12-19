import { getIronSession } from "iron-session"

// Session configuration
const sessionOptions = {
	password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
	cookieName: "startpage_session",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7 // 7 days
	}
}

/**
 * Get session from request/response
 */
export async function getSession(req, res) {
	return await getIronSession(req, res, sessionOptions)
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(req, res) {
	const session = await getSession(req, res)
	return session.authenticated === true
}

/**
 * Set user as authenticated
 */
export async function setAuthenticatedSession(req, res) {
	const session = await getSession(req, res)
	session.authenticated = true
	await session.save()
}

/**
 * Destroy session (logout)
 */
export async function destroySession(req, res) {
	const session = await getSession(req, res)
	session.destroy()
}
