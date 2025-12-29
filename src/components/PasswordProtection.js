import React, { useState, useEffect } from "react"
import Image from "next/image"
import {
	verifyPassword,
	setAuthenticated,
	getFailedAttempts,
	incrementFailedAttempts,
	getLockoutTimeRemaining,
	setLockout
} from "@/utils/passwordAuth"
import { useSettings } from "@/context/settings"
import { fetchAsset } from "@/utils/fetchAsset"

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 300 // 5 minutes in seconds

export default function PasswordProtection({ onAuthenticated }) {
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [rememberMe, setRememberMe] = useState(false)
	const [passwordHash, setPasswordHash] = useState(null)
	const [wallpaper, setWallpaper] = useState(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [failedAttempts, setFailedAttempts] = useState(0)
	const [lockoutTime, setLockoutTime] = useState(0)
	const [isAnimating, setIsAnimating] = useState(false)
	const { settings } = useSettings()
	const passwordInputRef = React.useRef(null)

	useEffect(() => {
		// Load password hash from API
		fetch("/api/getPasswordConfig")
			.then((res) => res.json())
			.then((data) => {
				if (data.enabled && data.passwordHash) {
					setPasswordHash(data.passwordHash)
				}
			})
			.catch((err) => {
				console.error("Failed to load password config:", err)
			})

		// Load failed attempts and lockout status
		setFailedAttempts(getFailedAttempts())
		setLockoutTime(getLockoutTimeRemaining())

		// Trigger entrance animation and focus input
		setTimeout(() => {
			setIsAnimating(true)
			// Focus the password input after animation starts
			if (passwordInputRef.current) {
				passwordInputRef.current.focus()
			}
		}, 100)
	}, [])

	useEffect(() => {
		if (!settings) return

		// Load wallpaper
		fetchAsset(settings.wallpaper.url)
			.then((data) => {
				if (data) {
					setWallpaper(data)
				}
			})
			.catch((error) => {
				console.error("Failed to fetch wallpaper:", error)
			})
	}, [settings])

	// Lockout timer countdown
	useEffect(() => {
		if (lockoutTime <= 0) return

		const timer = setInterval(() => {
			const remaining = getLockoutTimeRemaining()
			setLockoutTime(remaining)
			if (remaining <= 0) {
				setFailedAttempts(0)
				setError("")
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [lockoutTime])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")

		// Check lockout
		const lockout = getLockoutTimeRemaining()
		if (lockout > 0) {
			setError(`Too many failed attempts. Try again in ${lockout}s`)
			return
		}

		if (!passwordHash) {
			setError("Password not configured")
			return
		}

		try {
			// Call login API to verify password and create session
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ password })
			})

			const data = await response.json()

			if (response.ok && data.success) {
				// Also set local authentication for client-side checks
				setAuthenticated(true, rememberMe)
				onAuthenticated();
			} else {
				// Handle failed login
				const newAttempts = incrementFailedAttempts()
				setFailedAttempts(newAttempts)

				const remainingAttempts = MAX_ATTEMPTS - newAttempts

				if (remainingAttempts <= 0) {
					setLockout(LOCKOUT_DURATION)
					setLockoutTime(LOCKOUT_DURATION)
					setError(
						`Too many failed attempts. Locked out for ${LOCKOUT_DURATION / 60} minutes`
					)
				} else {
					setError(
						`Invalid password (${remainingAttempts} attempt${
							remainingAttempts !== 1 ? "s" : ""
						} remaining)`
					)
				}
				setPassword("")
			}
		} catch (error) {
			console.error("Login error:", error)
			setError("An error occurred. Please try again.")
			setPassword("")
		}
	}

	// Use settings if available, otherwise use safe defaults for password screen
	const safeSettings = settings || {
		wallpaper: { easing: "ease-in-out", fadeIn: true, blur: false, url: "" },
		terminal: { windowGlowColor: "#291f3325", windowGlow: false },
		theme: {
			textColor: "#e2e2e2",
			gray: "#97989d",
			blue: "#2bc3de"
		}
	}

	const isLockedOut = lockoutTime > 0

	return (
		<div className="fixed inset-0 z-50">
			{wallpaper && (
				<Image
					alt=""
					className={`transition-opacity w-screen h-screen -z-50 object-cover
					${safeSettings.wallpaper.easing}
					${safeSettings.wallpaper.fadeIn && "duration-1000"}
					${safeSettings.wallpaper.blur && "blur-wallpaper"}
					${isLoaded ? "opacity-100" : "opacity-0"}`}
					src={wallpaper}
					fill
					onLoad={() => {
						setIsLoaded(true)
					}}
				/>
			)}
			<div
				className={`absolute w-full h-fit inset-x-0 inset-y-0 m-auto shadow-lg rounded-terminal bg-window-color max-w-terminal p-terminal transition-all duration-300 ${
					safeSettings.terminal?.windowGlow && "window-glow"
				} ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
				<div className="h-full overflow-y-auto text-textColor">
					<div>
					<span className="flex cursor-default">
						<span className="text-green">guest</span>
						<span className="text-gray">@</span>
						<span className="text-magenta">startpage</span>
						<span className="text-magenta ml-2">❯</span>
						<span className="ml-2.5 text-textColor">lock</span>
					</span>

					<div className="mt-line">
						<span className="text-yellow">Authentication Required</span>
					</div>

					<div
						className="mt-line"
						style={{
							borderTopColor: safeSettings.theme.gray + "30",
							borderTopWidth: "1px",
							paddingTop: "1rem"
						}}>
						<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<div className="flex items-center gap-2 mb-1">
								<span className="text-blue">password</span>
								<span className="text-gray">»</span>
							</div>
							<div className="relative">
										<input
										ref={passwordInputRef}
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
											disabled={isLockedOut}
											className="w-full bg-transparent border-b focus:outline-none py-1 px-1 pr-8 disabled:opacity-50"
											style={{
											color: safeSettings.theme.textColor,
											borderColor: safeSettings.theme.gray + "40"
										}}
										onFocus={(e) =>
											!isLockedOut &&
											(e.currentTarget.style.borderColor =
												safeSettings.theme.blue)
										}
										onBlur={(e) =>
											(e.currentTarget.style.borderColor =
												safeSettings.theme.gray + "40")
											}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											disabled={isLockedOut}
											className="absolute right-0 top-1/2 -translate-y-1/2 text-sm hover:opacity-80 disabled:opacity-30"
											style={{ color: safeSettings.theme.blue }}>
											{showPassword ? "👁️" : "👁️‍🗨️"}
										</button>
									</div>
								</div>

								{error && (
									<div className="mb-4 flex items-center gap-2">
										<span className="text-red">✗</span>
										<span className="text-red">{error}</span>
									</div>
								)}

								{failedAttempts > 0 && !isLockedOut && (
									<div className="mb-4 flex items-center gap-2">
										<span className="text-yellow">⚠</span>
										<span className="text-yellow text-sm">
											{failedAttempts} failed attempt
											{failedAttempts !== 1 ? "s" : ""}
										</span>
									</div>
								)}

								<div className="flex items-center gap-2 mb-4">
									<input
										type="checkbox"
										id="rememberMe"
										checked={rememberMe}
										onChange={(e) => setRememberMe(e.target.checked)}
										disabled={isLockedOut}
										className="w-4 h-4 cursor-pointer disabled:opacity-50"
										style={{
										accentColor: safeSettings.theme.blue
										}}
									/>
									<label
										htmlFor="rememberMe"
										className="text-sm cursor-pointer select-none"
										style={{
										color: safeSettings.theme.gray,
											opacity: isLockedOut ? 0.5 : 1
										}}>
										Remember me for 7 days
									</label>
								</div>

								<div
									className="flex items-center gap-2"
									style={{
										borderTopColor: safeSettings.theme.gray + "30",
										borderTopWidth: "1px",
										paddingTop: "0.75rem"
									}}>
									<span className="text-gray">Press</span>
									<span
										className="px-2 py-0.5 rounded text-xs"
										style={{
											backgroundColor: safeSettings.theme.blue + "20",
											color: safeSettings.theme.blue,
											borderColor: safeSettings.theme.blue + "40",
											borderWidth: "1px"
										}}>
										ENTER
									</span>
									<span className="text-gray">to authenticate</span>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
