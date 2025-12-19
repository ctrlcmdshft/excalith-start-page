import fs from "fs"
import path from "path"
import { isAuthenticated } from "@/lib/session"

export default async function handler(req, res) {
	// Check if password protection is enabled - check environment variable first (Vercel)
	let passwordEnabled = !!process.env.STARTPAGE_PASSWORD_HASH

	// Fall back to file for local development
	if (!passwordEnabled) {
		const passwordConfigPath = path.join(process.cwd(), "data", ".password.json")
		if (fs.existsSync(passwordConfigPath)) {
			const passwordConfig = JSON.parse(fs.readFileSync(passwordConfigPath, "utf8"))
			passwordEnabled = passwordConfig.enabled === true
			console.log("Password protection enabled:", passwordEnabled)
		}
	}

	// If password protection is enabled, verify authentication
	if (passwordEnabled) {
		const authenticated = await isAuthenticated(req, res)
		console.log("User authenticated:", authenticated)
		if (!authenticated) {
			return res.status(401).json({ error: "Authentication required" })
		}
	}

	// Load and return settings
	const filePath = path.join(process.cwd(), "data", "settings.json")
	const fileContents = fs.readFileSync(filePath, "utf8")
	res.status(200).json(JSON.parse(fileContents))
}
