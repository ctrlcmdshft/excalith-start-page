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
		}
	}

	// If password protection is enabled, verify authentication
	if (passwordEnabled) {
		const authenticated = await isAuthenticated(req, res)
		if (!authenticated) {
			return res.status(401).json({ error: "Authentication required" })
		}
	}

	// Save settings
	const filePath = path.join(process.cwd(), "data", "settings.json")
	fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
	res.status(200).json({ message: "Settings saved" })
}
