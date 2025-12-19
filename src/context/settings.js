import { createContext, useContext, useEffect, useState } from "react"
import defaultConfig from "data/settings"

const SETTINGS_KEY = "settings"
const IS_DOCKER = process.env.BUILD_MODE === "docker"

export const SettingsContext = createContext({
	settings: undefined,
	setSettings: (settings) => {}
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
	const [settings, setSettings] = useState()
	const [items, setItems] = useState([])

	// Load settings
	useEffect(() => {
		let data

		if (IS_DOCKER) {
			fetch("/api/loadSettings")
				.then((response) => {
					if (response.status === 401) {
						// Authentication required - don't load settings
						console.log("Authentication required to load settings")
						return null
					}
					return response.json()
				})
				.then((data) => {
					if (data) {
						setSettings(data)
					}
				})
				.catch(() => setSettings(defaultConfig))
		} else {
			// Check if password protection is enabled before loading from localStorage
			fetch("/api/getPasswordConfig")
				.then((res) => res.json())
				.then((config) => {
					if (config.enabled) {
						// Password protection is enabled - load from API only
						fetch("/api/loadSettings")
							.then((response) => {
								if (response.status === 401) {
									// Not authenticated - don't load settings
									console.log("Authentication required to load settings")
									return null
								}
								return response.json()
							})
							.then((data) => {
								if (data) {
									setSettings(data)
								}
							})
							.catch(() => setSettings(defaultConfig))
					} else {
						// No password protection - use localStorage as before
						data = localStorage.getItem(SETTINGS_KEY)
						if (data === "undefined") {
							console.log("LocalStorage configuration reset to defaults.")
						}
						setSettings(data ? JSON.parse(data) : defaultConfig)
					}
				})
				.catch(() => {
					// If can't check password config, fall back to localStorage
					data = localStorage.getItem(SETTINGS_KEY)
					if (data === "undefined") {
						console.log("LocalStorage configuration reset to defaults.")
					}
					setSettings(data ? JSON.parse(data) : defaultConfig)
				})
		}
	}, [])

	// Save settings
	useEffect(() => {
		if (settings && settings !== "undefined") {
			if (IS_DOCKER) {
				fetch("/api/saveSettings", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(settings)
				})
			} else {
				// Check if password protection is enabled
				fetch("/api/getPasswordConfig")
					.then((res) => res.json())
					.then((config) => {
						if (config.enabled) {
							// Password protection enabled - save to server only, clear localStorage
							localStorage.removeItem(SETTINGS_KEY)
							fetch("/api/saveSettings", {
								method: "POST",
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify(settings)
							})
						} else {
							// No password protection - save to localStorage
							localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
						}
					})
					.catch(() => {
						// If can't check, save to localStorage as fallback
						localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
					})
			}

			let filterArr = [
				"help",
				"fetch",
				"config",
				"config help",
				"config edit",
				"config import",
				"config theme",
				"config reset"
			]

			fetch("/api/getTheme")
				.then((response) => response.json())
				.then((data) => {
					if (!data.message) {
						data.forEach((theme) => {
							filterArr.push("config theme " + theme)
						})
					}
				})
				.catch((error) => console.log(`Error fetching themes: ${error.message}`))

			settings.sections.list.map((section) => {
				section.links.map((link) => {
					{
						filterArr.push(link.name.toLowerCase())
					}
				})
			})
			setItems(filterArr)
		}
	}, [settings])

	// Update settings
	const updateSettings = async (newSettings) => {
		await setSettings(newSettings)
	}

	// Reset settings
	const resetSettings = () => {
		setSettings(defaultConfig)
	}

	return (
		<SettingsContext.Provider
			value={{ settings, setSettings: updateSettings, resetSettings, items }}>
			{children}
		</SettingsContext.Provider>
	)
}
