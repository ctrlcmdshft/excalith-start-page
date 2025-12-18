import fs from "fs"
import path from "path"

export default function handler(req, res) {
	try {
		// Check environment variable first (for Vercel/production)
		const envPasswordHash = process.env.STARTPAGE_PASSWORD_HASH

		if (envPasswordHash) {
			return res.status(200).json({
				enabled: true,
				hasPassword: true,
				passwordHash: envPasswordHash,
				source: "env"
			})
		}

		// Fall back to file (for local development)
		const passwordConfigPath = path.join(process.cwd(), "data", ".password.json")

		// Create default config if doesn't exist
		if (!fs.existsSync(passwordConfigPath)) {
			const defaultConfig = {
				enabled: false,
				passwordHash: null
			}
			fs.writeFileSync(passwordConfigPath, JSON.stringify(defaultConfig, null, "\t"))
		}

		const data = fs.readFileSync(passwordConfigPath, "utf8")
		const config = JSON.parse(data)

		// Return safe config
		res.status(200).json({
			enabled: config.enabled || false,
			hasPassword: config.passwordHash !== null && config.passwordHash !== "",
			passwordHash: config.enabled && config.passwordHash ? config.passwordHash : null,
			source: "file"
		})
	} catch (error) {
		console.error("Error reading password config:", error)
		res.status(200).json({
			enabled: false,
			hasPassword: false,
			passwordHash: null,
			source: "none"
		})
	}
}
