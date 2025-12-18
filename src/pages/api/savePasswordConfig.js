import fs from "fs"
import path from "path"

export default function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" })
	}

	try {
		// Only allow saving in development (when no env var is set)
		if (process.env.STARTPAGE_PASSWORD_HASH) {
			return res.status(403).json({
				error: "Password is managed via environment variable. Update STARTPAGE_PASSWORD_HASH in your hosting dashboard."
			})
		}

		const { passwordHash, enabled } = req.body

		if (typeof enabled !== "boolean") {
			return res.status(400).json({ error: "Invalid enabled value" })
		}

		if (enabled && !passwordHash) {
			return res.status(400).json({ error: "Password hash required when enabled" })
		}

		const passwordConfigPath = path.join(process.cwd(), "data", ".password.json")

		const config = {
			enabled,
			passwordHash: passwordHash || null
		}

		fs.writeFileSync(passwordConfigPath, JSON.stringify(config, null, "\t"))

		res.status(200).json({ success: true })
	} catch (error) {
		console.error("Error saving password config:", error)
		res.status(500).json({ error: "Failed to save password config" })
	}
}
