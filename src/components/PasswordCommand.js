import React from "react"
import Prompt from "./Prompt"
import { isPasswordEnabled, setAuthenticated } from "@/utils/passwordAuth"

const PasswordCommand = ({ hostname }) => {
	const renderLogEntry = (text, type = "") => (
		<div className="output-line">
			<div
				style={{
					color: `var(--${type || "white"})`
				}}>
				{text}
			</div>
		</div>
	)

	const handleLock = () => {
		// Check if password protection is enabled
		if (!isPasswordEnabled()) {
			return (
				<>
					<Prompt hostname={hostname} />
					{renderLogEntry("Password protection is not enabled", "yellow")}
					{renderLogEntry(
						"Set STARTPAGE_PASSWORD_HASH environment variable to enable",
						"white"
					)}
				</>
			)
		}

		// Clear authentication and reload
		setAuthenticated(false)
		window.location.reload()

		return (
			<>
				<Prompt hostname={hostname} />
				{renderLogEntry("Locking...", "yellow")}
			</>
		)
	}

	return handleLock()
}

export default PasswordCommand
