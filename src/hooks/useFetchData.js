import { useEffect, useState } from "react"
import moment from "moment"
import { useSettings } from "@/context/settings"
import { UAParser } from "ua-parser-js"
import packageInfo from "../../package.json"

const useFetchData = () => {
	const { settings } = useSettings()
	const version = packageInfo.version

	const uap = new UAParser()
	const result = uap?.getResult()

	const [data, setData] = useState({
		version: version,
		theme: settings?.theme?.name || "Unknown",
		time: moment().format(settings?.fetch?.timeFormat || "h:mm A"),
		date: moment().format(settings?.fetch?.dateFormat || "MM/DD/YYYY"),
		osName: result.os.name || "Unknown",
		osVersion: result.os.version || "Unknown",
		browser: result.browser.name || "Unknown",
		browserLower: result.browser.name?.toLowerCase() || "unknown",
		browserVersion: result.browser.version || "0",
		engineName: result.engine.name || "Unknown",
		engineVersion: result.engine.version || "0"
	})

	useEffect(() => {
		// Try to get more accurate OS info with client hints
		const getOSInfo = async () => {
			try {
				const os = await uap.getOS().withClientHints()
				// Client hints can detect Windows 11 properly
				const osName = os.name || result.os.name || "Unknown"
				const osVersion = os.version || result.os.version || "Unknown"
				
				setData(prevData => ({
					...prevData,
					osName: osName,
					osVersion: osVersion
				}))
			} catch (error) {
				// Fallback to basic parsing if client hints fail
				console.log("Client hints not available, using basic OS detection")
			}
		}

		getOSInfo()

		setData(prevData => ({
			...prevData,
			version: version,
			theme: settings.theme.name,
			time: moment().format(settings.fetch.timeFormat),
			date: moment().format(settings.fetch.dateFormat),
			browser: result.browser.name,
			browserLower: result.browser.name.toLowerCase(),
			browserVersion: result.browser.version,
			engineName: result.engine.name,
			engineVersion: result.engine.version
		}))
		// eslint-disable-next-line
	}, [settings])

	return [data]
}

export default useFetchData
