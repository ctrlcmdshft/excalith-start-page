import { useState } from "react"
import Prompt from "@/components/Prompt"
import { useSettings } from "@/context/settings"

const Toggle = ({ label, value, onChange }) => (
	<label className="flex items-center justify-between gap-4 py-0.5 cursor-pointer text-sm leading-6">
		<span>{label}</span>
		<input
			type="checkbox"
			checked={value}
			onChange={(event) => onChange(event.target.checked)}
		/>
	</label>
)

const SettingsPanel = ({ closeCallback }) => {
	const { settings, setSettings } = useSettings()
	const [saved, setSaved] = useState(false)
	const status = settings.status || { clock: true, date: false, weather: true }

	const update = (section, key, value) => {
		setSettings({ ...settings, [section]: { ...settings[section], [key]: value } })
		setSaved(true)
	}

	return (
		<div className="max-h-full overflow-y-auto text-textColor" onClick={closeCallback}>
			<div className="text-sm" onClick={(event) => event.stopPropagation()}>
				<Prompt command="settings" />
				<div className="grid grid-cols-2 gap-x-8">
					<section>
						<div className="mt-2 mb-1 text-green">Status widgets</div>
						<Toggle
							label="Clock"
							value={status.clock}
							onChange={(value) => update("status", "clock", value)}
						/>
						<Toggle
							label="Date"
							value={status.date}
							onChange={(value) => update("status", "date", value)}
						/>
						<Toggle
							label="Weather"
							value={status.weather}
							onChange={(value) => update("status", "weather", value)}
						/>
					</section>
					<section>
						<div className="mt-2 mb-1 text-green">Wallpaper</div>
						<Toggle
							label="Fade in"
							value={settings.wallpaper.fadeIn}
							onChange={(value) => update("wallpaper", "fadeIn", value)}
						/>
						<Toggle
							label="Blur"
							value={settings.wallpaper.blur}
							onChange={(value) => update("wallpaper", "blur", value)}
						/>
					</section>
					<section>
						<div className="mt-2 mb-1 text-green">Terminal</div>
						<Toggle
							label="Window glow"
							value={settings.terminal.windowGlow}
							onChange={(value) => update("terminal", "windowGlow", value)}
						/>
						<Toggle
							label="Text glow"
							value={settings.terminal.textGlow}
							onChange={(value) => update("terminal", "textGlow", value)}
						/>
					</section>
					<section>
						<div className="mt-2 mb-1 text-green">Links</div>
						<label className="flex items-center justify-between gap-4 py-0.5 text-sm leading-6">
							<span>Open links in</span>
							<select
								className="bg-transparent text-textColor"
								value={settings.urlLaunch.target}
								onChange={(event) =>
									update("urlLaunch", "target", event.target.value)
								}>
								<option value="_self">This tab</option>
								<option value="_blank">New tab</option>
							</select>
						</label>
					</section>
				</div>
				{saved && <p className="mt-2 text-gray">Saved automatically.</p>}
				<p className="mt-2 text-gray">Press ESC or click outside to close.</p>
			</div>
		</div>
	)
}

export default SettingsPanel
