import React, { useState, useEffect } from "react"
import Prompt from "./Prompt"
import { setAuthenticated } from "@/utils/passwordAuth"

const PasswordCommand = ({ closeCallback }) => {
	const [passwordHash, setPasswordHash] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const checkPassword = async () => {
			try {
				const response = await fetch("/api/getPasswordConfig")
				const data = await response.json()
				setPasswordHash(data.enabled && data.passwordHash ? data.passwordHash : null)
			} catch (error) {
				console.error("Failed to check password status:", error)
				setPasswordHash(null)
			} finally {
				setLoading(false)
			}
		}
		checkPassword()
	}, [])

	useEffect(() => {
		if (!loading) {
			if (passwordHash) {
				// Password is enabled, lock the screen
				setAuthenticated(false)
				// Small delay to ensure state is cleared
				setTimeout(() => {
					window.location.reload()
				}, 100)
			}
		}
		// eslint-disable-next-line
	}, [loading, passwordHash])

	return (
		<div className="h-full w-full overflow-y-auto p-5 text-textColor">
			<Prompt command="lock" />
			{loading && <div className="text-gray mt-4">Checking password configuration...</div>}
			{!loading && !passwordHash && (
				<div className="mt-4">
					<div className="text-yellow mb-2">Password protection is not enabled</div>
					<div className="text-gray text-sm mt-2">
						Set STARTPAGE_PASSWORD_HASH environment variable to enable password protection
					</div>
				</div>
			)}
			{!loading && passwordHash && (
				<div className="text-yellow mt-4">Locking screen...</div>
			)}
		</div>
	)
}

export default PasswordCommand
