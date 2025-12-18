import React, { useEffect, useState } from "react"
import Image from "next/image"
import Meta from "@/components/Meta"
import Terminal from "@/components/Terminal"
import PasswordProtection from "@/components/PasswordProtection"
import "@fontsource/fira-code/400.css"
import "@fontsource/fira-code/600.css"
import { useSettings } from "@/context/settings"
import { fetchAsset } from "@/utils/fetchAsset"
import { isPasswordEnabled, isAuthenticated } from "@/utils/passwordAuth"
import packageInfo from "../../package.json"

export default function Home() {
	const { settings } = useSettings()
	const [wallpaper, setWallpaper] = useState(null)
	const [isReady, setIsReady] = useState(false)
	const [isLoaded, setIsLoaded] = useState(false)
	const [showPasswordProtection, setShowPasswordProtection] = useState(false)
	const [checkingAuth, setCheckingAuth] = useState(true)

	useEffect(() => {
		const info = `\u00A9 2022-${new Date().getFullYear()} Can Cellek\n\nStart Page designed by Can Cellek\nCheck out the source code at\nhttps://github.com/excalith/excalith-start-page`
		console.log(info)

		// Check password protection status
		const checkAuth = async () => {
			try {
				const passwordRequired = await isPasswordEnabled()
				const authenticated = isAuthenticated()

				if (passwordRequired && !authenticated) {
					setShowPasswordProtection(true)
				}
			} catch (error) {
				console.error("Error checking password status:", error)
				// If there's an error checking, allow access (fail open)
			} finally {
				setCheckingAuth(false)
			}
		}

		checkAuth()
	}, [])

	useEffect(() => {
		if (!settings) return

		// Get variables from config
		const documentStyle = document.documentElement.style

		// Set Terminal
		documentStyle.setProperty("--glow-color", settings.terminal.windowGlowColor)
		documentStyle.setProperty("--background-color", settings.theme.backgroundColor)

		// Set Terminal Opacity / Blur (if opacity is 0, blur is used instead)
		if (settings.terminal.opacity > 0) {
			documentStyle.setProperty("--window-color", settings.theme.windowColor)
			documentStyle.setProperty("--window-opacity", settings.terminal.opacity)
			documentStyle.setProperty("--window-blur", 0 + "px")
		} else {
			documentStyle.setProperty("--window-color", "transparent")
			documentStyle.setProperty("--window-opacity", 1)
			documentStyle.setProperty("--window-blur", settings.terminal.blur + "px")
		}

		// Set Prompt Selection Color
		documentStyle.setProperty("--selection-fg", "var(--" + settings.prompt.selectionFg + ")")
		documentStyle.setProperty("--selection-bg", "var(--" + settings.prompt.selectionBg + ")")
		documentStyle.setProperty(
			"--placeholder-color",
			"var(--" + settings.prompt.placeholderColor + ")"
		)

		// Set URL Color
		documentStyle.setProperty("--url-hover", "var(--" + settings.urlLaunch.hoverColor + ")")

		// Set Text Colors
		documentStyle.setProperty("--text-color", settings.theme.textColor)
		documentStyle.setProperty("--white", settings.theme.white)
		documentStyle.setProperty("--gray", settings.theme.gray)
		documentStyle.setProperty("--black", settings.theme.black)
		documentStyle.setProperty("--red", settings.theme.red)
		documentStyle.setProperty("--green", settings.theme.green)
		documentStyle.setProperty("--yellow", settings.theme.yellow)
		documentStyle.setProperty("--blue", settings.theme.blue)
		documentStyle.setProperty("--magenta", settings.theme.magenta)
		documentStyle.setProperty("--cyan", settings.theme.cyan)

		// Check text glow
		if (settings.terminal.textGlow) {
			document.body.classList.add("text-glow")
		} else {
			document.body.classList.remove("text-glow")
		}

		// Set Wallpaper
		fetchAsset(settings.wallpaper.url)
			.then((data) => {
				if (data) {
					setWallpaper(data)
				}
			})
			.catch((error) => {
				console.error("Failed to fetch wallpaper:", error)
			})

		setIsReady(true)
	}, [settings])

	const handleAuthenticated = () => {
		setShowPasswordProtection(false)
	}

	if (checkingAuth) {
		return (
			<div className="w-screen h-screen bg-black flex items-center justify-center">
				<div className="text-white text-sm">Loading...</div>
			</div>
		)
	}

	if (showPasswordProtection) {
		return <PasswordProtection onAuthenticated={handleAuthenticated} />
	}

	return (
		<main className={"transition-all duration-200 ease-in-out"}>
			{isReady && (
				<>
					<Meta />
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
					<div className={`animate-fadeIn`}>
						<Terminal />
					</div>
					<div className="fixed bottom-2 right-4 text-xs text-white opacity-50 hover:opacity-100 transition-opacity">
						v{packageInfo.version}
					</div>
				</>
			)}
		</main>
	)
}
