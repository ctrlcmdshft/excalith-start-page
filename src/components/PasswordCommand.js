import React, { useEffect, useState } from "react"
import Prompt from "@/components/Prompt"
import { hashPassword, verifyPassword, verifyEmergencyCode, setAuthenticated } from "@/utils/passwordAuth"

const PasswordCommand = ({ commands, closeCallback }) => {
	const [command] = useState(commands.join(" "))
	const [consoleLog, setConsoleLog] = useState([])
	const [isDone, setDone] = useState(false)

	useEffect(() => {
		setConsoleLog([])

		const cmd = commands[0]

		if (cmd === "setpass") {
			handleSetPassword()
		} else if (cmd === "changepass") {
			handleChangePassword()
		} else if (cmd === "resetpass") {
			handleResetPassword()
		} else if (cmd === "removepass") {
			handleRemovePassword()
		} else if (cmd === "emergency") {
			handleEmergency()
		} else if (cmd === "lock") {
			handleLock()
		}
		// eslint-disable-next-line
	}, [])

	const handleSetPassword = async () => {
		try {
			// Check if password already exists
			const configResponse = await fetch("/api/getPasswordConfig")
			const config = await configResponse.json()

			if (config.hasPassword) {
				appendToLog("Password already set. Use 'changepass' to change it.", "error")
				setDone(true)
				return
			}

			if (commands.length < 2) {
				appendToLog("Usage: setpass <new-password>", "error")
				setDone(true)
				return
			}

			const newPassword = commands.slice(1).join(" ")
			if (newPassword.length < 4) {
				appendToLog("Password must be at least 4 characters", "error")
				setDone(true)
				return
			}

			const hash = await hashPassword(newPassword)

			const saveResponse = await fetch("/api/savePasswordConfig", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passwordHash: hash, enabled: true })
			})

			if (saveResponse.ok) {
				appendToLog("✓ Password set successfully!", "success")
				appendToLog("Password protection is now enabled", "success")
				appendToLog("", "")
				appendToLog("Note: Keep your password safe!", "warning")
				appendToLog("If you forget it, use 'emergency' command for reset code", "info")
			} else {
				appendToLog("Failed to save password", "error")
			}
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
		}
		setDone(true)
	}

	const handleChangePassword = async () => {
		try {
			// Check if password exists
			const configResponse = await fetch("/api/getPasswordConfig")
			const config = await configResponse.json()

			if (!config.hasPassword) {
				appendToLog("No password set. Use 'setpass' first.", "error")
				setDone(true)
				return
			}

			if (commands.length < 3) {
				appendToLog("Usage: changepass <current-password> <new-password>", "error")
				setDone(true)
				return
			}

			const currentPassword = commands[1]
			const newPassword = commands.slice(2).join(" ")

			if (newPassword.length < 4) {
				appendToLog("New password must be at least 4 characters", "error")
				setDone(true)
				return
			}

			// Verify current password
			const isValid = await verifyPassword(currentPassword, config.passwordHash)
			if (!isValid) {
				appendToLog("Current password is incorrect", "error")
				setDone(true)
				return
			}

			// Set new password
			const hash = await hashPassword(newPassword)
			const saveResponse = await fetch("/api/savePasswordConfig", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passwordHash: hash, enabled: true })
			})

			if (saveResponse.ok) {
				appendToLog("✓ Password changed successfully!", "success")
			} else {
				appendToLog("Failed to save new password", "error")
			}
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
		}
		setDone(true)
	}

	const handleResetPassword = async () => {
		try {
			if (commands.length < 2) {
				appendToLog("Usage: resetpass <emergency-code> [new-password]", "error")
				appendToLog("", "")
				appendToLog("Get emergency code with 'emergency' command", "info")
				setDone(true)
				return
			}

			const emergencyCode = commands[1]
			const isValid = await verifyEmergencyCode(emergencyCode)

			if (!isValid) {
				appendToLog("Invalid or expired emergency code", "error")
				appendToLog("Code is valid for 1 hour only", "warning")
				setDone(true)
				return
			}

			// If new password provided, set it
			if (commands.length >= 3) {
				const newPassword = commands.slice(2).join(" ")
				if (newPassword.length < 4) {
					appendToLog("New password must be at least 4 characters", "error")
					setDone(true)
					return
				}

				const hash = await hashPassword(newPassword)
				const saveResponse = await fetch("/api/savePasswordConfig", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ passwordHash: hash, enabled: true })
				})

				if (saveResponse.ok) {
					appendToLog("✓ Password reset successfully!", "success")
					appendToLog("New password has been set", "success")
				} else {
					appendToLog("Failed to save new password", "error")
				}
			} else {
				// Just disable password protection
				const saveResponse = await fetch("/api/savePasswordConfig", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ passwordHash: null, enabled: false })
				})

				if (saveResponse.ok) {
					appendToLog("✓ Password protection disabled", "success")
					appendToLog("Use 'setpass' to set a new password", "info")
				} else {
					appendToLog("Failed to disable password", "error")
				}
			}
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
		}
		setDone(true)
	}

	const handleEmergency = async () => {
		try {
			const response = await fetch("/api/getEmergencyCode")
			const data = await response.json()

			if (data.code) {
				appendToLog("Emergency Reset Code:", "title")
				appendToLog("", "")
				appendToLog(`  ${data.code}`, "success")
				appendToLog("", "")
				appendToLog("This code is valid until:", "info")
				appendToLog(`  ${new Date(data.validUntil).toLocaleString()}`, "info")
				appendToLog("", "")
				appendToLog("Usage:", "warning")
				appendToLog("  resetpass " + data.code, "help")
				appendToLog("  resetpass " + data.code + " <new-password>", "help")
			} else {
				appendToLog("Failed to generate emergency code", "error")
			}
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
		}
		setDone(true)
	}

	const handleRemovePassword = async () => {
		try {
			// Check if password exists
			const configResponse = await fetch("/api/getPasswordConfig")
			const config = await configResponse.json()

			if (!config.hasPassword) {
				appendToLog("No password set to remove.", "warning")
				setDone(true)
				return
			}

			if (commands.length < 2) {
				appendToLog("Usage: removepass <current-password>", "error")
				appendToLog("", "")
				appendToLog("This will disable password protection", "info")
				setDone(true)
				return
			}

			const currentPassword = commands.slice(1).join(" ")

			// Verify current password
			const isValid = await verifyPassword(currentPassword, config.passwordHash)
			if (!isValid) {
				appendToLog("Current password is incorrect", "error")
				setDone(true)
				return
			}

			// Disable password protection
			const saveResponse = await fetch("/api/savePasswordConfig", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ passwordHash: null, enabled: false })
			})

			if (saveResponse.ok) {
				appendToLog("✓ Password protection removed!", "success")
				appendToLog("Your start page is no longer password protected", "info")
			} else {
				appendToLog("Failed to remove password", "error")
			}
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
		}
		setDone(true)
	}

	const handleLock = async () => {
		try {
			// Check if password protection is enabled
			const configResponse = await fetch("/api/getPasswordConfig")
			const config = await configResponse.json()

			if (!config.enabled || !config.hasPassword) {
				appendToLog("Password protection is not enabled", "warning")
				appendToLog("Use 'setpass' to enable password protection first", "info")
				setDone(true)
				return
			}

			appendToLog("Locking screen...", "")
			appendToLog("", "")
			
			// Clear authentication and reload
			setAuthenticated(false)
			
			setTimeout(() => {
				window.location.reload()
			}, 500)
		} catch (error) {
			appendToLog("Error: " + error.message, "error")
			setDone(true)
		}
	}

	const appendToLog = (text, type) => {
		setConsoleLog((consoleLog) => [...consoleLog, { type: type, text: text }])
	}

	const closeWindow = () => {
		closeCallback()
	}

	const renderLogEntry = (entry, index) => {
		const { type, text } = entry

		if (type === "title") {
			return (
				<div key={index} className="text-yellow-300 font-semibold">
					{text}
				</div>
			)
		} else if (type === "success") {
			return (
				<div key={index} className="text-green-400">
					{text}
				</div>
			)
		} else if (type === "error") {
			return (
				<div key={index} className="text-red-400">
					{text}
				</div>
			)
		} else if (type === "warning") {
			return (
				<div key={index} className="text-yellow-400">
					{text}
				</div>
			)
		} else if (type === "info") {
			return (
				<div key={index} className="text-cyan-400">
					{text}
				</div>
			)
		} else if (type === "help") {
			return (
				<div key={index} className="flex">
					<div className="text-gray-400 min-w-[250px]">{text[0]}</div>
					<div className="text-gray-500">{text[1]}</div>
				</div>
			)
		} else {
			return <div key={index} className="text-white">{text}</div>
		}
	}

	return (
		<div className="w-full h-full p-4">
			<div className="text-left">
				<Prompt command={command} />
				<div className="mt-2 space-y-1">
					{consoleLog.map((entry, index) => renderLogEntry(entry, index))}
				</div>
			</div>
			{isDone && (
				<div className="mt-4">
					<button
						onClick={closeWindow}
						className="text-sm text-gray-400 hover:text-white"
					>
						Press ESC or click here to close
					</button>
				</div>
			)}
		</div>
	)
}

export default PasswordCommand
