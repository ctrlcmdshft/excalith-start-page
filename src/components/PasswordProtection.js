import React, { useState, useEffect } from "react"
import Image from "next/image"
import { verifyPassword, setAuthenticated } from "@/utils/passwordAuth"
import { useSettings } from "@/context/settings"
import { fetchAsset } from "@/utils/fetchAsset"

export default function PasswordProtection({ onAuthenticated }) {
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [passwordHash, setPasswordHash] = useState(null)
	const [wallpaper, setWallpaper] = useState(null)
	const [isLoaded, setIsLoaded] = useState(false)
	const { settings } = useSettings()

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

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")

		if (!passwordHash) {
			setError("Password not configured")
			return
		}

		// Verify password
		const isValid = await verifyPassword(password, passwordHash)
		if (isValid) {
			setAuthenticated(true)
			onAuthenticated()
		} else {
			setError("Invalid password")
			setPassword("")
		}
	}

	if (!settings) return null

	return (
		<div className="fixed inset-0 z-50">
			{wallpaper && (
				<Image
					alt=""
					className={`transition-opacity w-screen h-screen -z-50 object-cover
					${settings.wallpaper.easing}
					${settings.wallpaper.fadeIn && "duration-1000"}
					${settings.wallpaper.blur && "blur-wallpaper"}
					${isLoaded ? "opacity-100" : "opacity-0"}`}
					src={wallpaper}
					fill
					onLoad={() => {
						setIsLoaded(true)
					}}
				/>
			)}
			<div 
				className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
				style={{ backgroundColor: settings.theme.backgroundColor + '80' }}
			>
				<div 
					className="w-full max-w-md p-10 backdrop-blur-md rounded-2xl shadow-2xl"
					style={{ 
						backgroundColor: settings.theme.windowColor + 'dd',
						borderColor: settings.theme.gray + '80',
						borderWidth: '1px'
					}}
				>
					<div className="text-center mb-8">
						<div className="text-6xl mb-4">🔒</div>
						<h2 
							className="text-3xl font-semibold"
							style={{ color: settings.theme.textColor }}
						>
							Password Required
						</h2>
					</div>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password..."
								autoFocus
								className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
								style={{
									backgroundColor: settings.theme.black + 'cc',
									borderColor: settings.theme.gray,
									borderWidth: '1px',
									color: settings.theme.textColor
								}}
							/>
						</div>
						{error && (
							<div 
								className="text-sm text-center font-medium animate-pulse py-2 rounded-lg"
								style={{
									color: settings.theme.red,
									backgroundColor: settings.theme.red + '20',
									borderColor: settings.theme.red + '60',
									borderWidth: '1px'
								}}
							>
								{error}
							</div>
						)}
						<button
							type="submit"
							className="w-full py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
							style={{
								backgroundColor: settings.theme.blue,
								color: settings.theme.white
							}}
							onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
							onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
						>
							Unlock
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

