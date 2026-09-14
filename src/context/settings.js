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
	// Render with the bundled config immediately. Browser storage or the Docker
	// API replaces it once available, which prevents a blank first paint.
	const [settings, setSettings] = useState(defaultConfig)
	const [settingsLoaded, setSettingsLoaded] = useState(false)
	const [items, setItems] = useState([])

	// Load settings
	useEffect(() => {
		let data

		if (IS_DOCKER) {
			fetch("/api/loadSettings")
				.then((response) => response.json())
				.then((data) => setSettings(data))
				.catch(() => {})
				.finally(() => setSettingsLoaded(true))
		} else {
			data = localStorage.getItem(SETTINGS_KEY)
			if (data === "undefined") {
				console.log("LocalStorage configuration reset to defaults.")
			}
			if (data && data !== "undefined") setSettings(JSON.parse(data))
			setSettingsLoaded(true)
		}
	}, [])

	// Save settings
	useEffect(() => {
		if (settingsLoaded && settings && settings !== "undefined") {
			if (IS_DOCKER) {
				fetch("/api/saveSettings", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(settings)
				})
			} else {
				localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
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
	}, [settings, settingsLoaded])

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
