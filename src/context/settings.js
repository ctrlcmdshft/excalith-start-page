import { createContext, useContext, useEffect, useState } from "react"
import defaultConfig from "data/settings"

const SETTINGS_KEY = "settings"
const IS_DOCKER = process.env.BUILD_MODE === "docker"

const mergeDefaults = (defaults, saved) => {
	if (Array.isArray(defaults) || Array.isArray(saved)) return saved ?? defaults
	if (defaults && typeof defaults === "object" && saved && typeof saved === "object") {
		return Object.keys(defaults).reduce(
			(result, key) => ({ ...result, [key]: mergeDefaults(defaults[key], saved[key]) }),
			{ ...saved }
		)
	}
	return saved ?? defaults
}

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
				.then((data) => setSettings(mergeDefaults(defaultConfig, data)))
				.catch(() => {})
				.finally(() => setSettingsLoaded(true))
		} else {
			data = localStorage.getItem(SETTINGS_KEY)
			if (data === "undefined") {
				console.log("LocalStorage configuration reset to defaults.")
			}
			if (data && data !== "undefined")
				setSettings(mergeDefaults(defaultConfig, JSON.parse(data)))
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
				"list",
				"help",
				"fetch",
				"config",
				"settings",
				"theme",
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
		await setSettings(mergeDefaults(defaultConfig, newSettings))
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
