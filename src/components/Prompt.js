import { useSettings } from "@/context/settings"
import { useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

const Prompt = ({ command, showSymbol = true }) => {
	const { settings } = useSettings()
	const [browserName, setBrowserName] = useState("unknown")

	useEffect(() => {
		setBrowserName(new UAParser().getBrowser().name?.toLowerCase() || "unknown")
	}, [])
	const lower_username = settings.username.toLowerCase()
	const promptSettings = settings.prompt

	return (
		<span className="flex cursor-default">
			<span className={`text-${promptSettings.userColor}`}>{lower_username}</span>
			<span className={`text-${promptSettings.atColor}`}>@</span>
			<span className={`text-${promptSettings.hostColor}`}>{browserName}</span>
			{showSymbol && (
				<span className={`text-${promptSettings.promptColor} ml-2`}>
					{" "}
					{promptSettings.promptSymbol}{" "}
				</span>
			)}
			{command && <span className="ml-2.5 text-textColor">{command}</span>}
		</span>
	)
}

export default Prompt
