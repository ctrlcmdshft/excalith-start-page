import { setAuthenticatedSession } from "@/lib/session"
import fs from "fs"
import path from "path"
import crypto from "crypto"

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" })
	}

	try {
		const { password } = req.body

		if (!password) {
			return res.status(400).json({ error: "Password is required" })
		}

		// Load password configuration - check environment variable first (Vercel)
		let passwordHash = process.env.STARTPAGE_PASSWORD_HASH
		let enabled = !!passwordHash

		// Fall back to file for local development
		if (!passwordHash) {
			const configPath = path.join(process.cwd(), "data", ".password.json")
			
			if (!fs.existsSync(configPath)) {
				return res.status(400).json({ error: "Password protection not configured" })
			}

			const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
			enabled = config.enabled
			passwordHash = config.passwordHash
		}

		if (!enabled || !passwordHash) {
			return res.status(400).json({ error: "Password protection not enabled" })
		}

		// Verify password using SHA-256 (matching the existing hash format)
		const hash = crypto.createHash("sha256").update(password).digest("hex")
		const isValid = hash === passwordHash

		if (!isValid) {
			return res.status(401).json({ error: "Invalid password" })
		}

		// Create authenticated session
		await setAuthenticatedSession(req, res)

		return res.status(200).json({ success: true })
	} catch (error) {
		console.error("Login error:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
