import React, { useEffect, useState } from "react"
import Prompt from "@/components/Prompt"
import { useSettings } from "@/context/settings"
import { Icon } from "@iconify/react"

const ThemePreviewer = ({ closeCallback }) => {
	const { settings, setSettings } = useSettings()
	const [themes, setThemes] = useState([])
	const [selectedTheme, setSelectedTheme] = useState(null)
	const [previewTheme, setPreviewTheme] = useState(null)
	const [filter, setFilter] = useState("all") // all, dark, light
	const [searchQuery, setSearchQuery] = useState("")
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Fetch all available themes
		fetch("/api/getTheme")
			.then((response) => response.json())
			.then((data) => {
				if (data && Array.isArray(data)) {
					// Fetch each theme's details
					Promise.all(
						data.map((themeName) =>
							fetch(`/api/getTheme?name=${themeName}`)
								.then((res) => res.json())
								.then((themeData) => ({
									name: themeName,
									...themeData
								}))
						)
					).then((themesData) => {
						setThemes(themesData.filter((t) => t.name))
						setIsLoading(false)
					})
				}
			})
			.catch((error) => {
				console.error("Error fetching themes:", error)
				setIsLoading(false)
			})
	}, [])

	const applyTheme = (theme) => {
		const newSettings = {
			...settings,
			theme: {
				name: theme.name,
				backgroundColor: theme.backgroundColor,
				windowColor: theme.windowColor,
				textColor: theme.textColor,
				black: theme.black,
				red: theme.red,
				green: theme.green,
				yellow: theme.yellow,
				blue: theme.blue,
				magenta: theme.magenta,
				cyan: theme.cyan,
				white: theme.white,
				gray: theme.gray
			}
		}
		setSettings(newSettings)
		closeCallback()
	}

	const isLightTheme = (theme) => {
		// Simple heuristic: check if background is light
		const bg = theme.backgroundColor
		if (!bg) return false
		const hex = bg.replace("#", "")
		const r = parseInt(hex.substr(0, 2), 16)
		const g = parseInt(hex.substr(2, 2), 16)
		const b = parseInt(hex.substr(4, 2), 16)
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 128
	}

	const filteredThemes = themes.filter((theme) => {
		// Apply filter
		if (filter === "dark" && isLightTheme(theme)) return false
		if (filter === "light" && !isLightTheme(theme)) return false

		// Apply search
		if (searchQuery && !theme.name.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false
		}

		return true
	})

	const ColorSwatch = ({ color, label }) => (
		<div className="flex items-center gap-2">
			<div
				className="w-6 h-6 rounded border border-gray border-opacity-30"
				style={{ backgroundColor: color }}
			/>
			<span className="text-xs text-gray">{label}</span>
		</div>
	)

	const ThemeCard = ({ theme }) => {
		const isSelected = selectedTheme?.name === theme.name
		const isPreview = previewTheme?.name === theme.name
		const isCurrent = settings.theme.name === theme.name

		return (
			<div
				className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
					isPreview
						? "border-yellow border-opacity-100 shadow-lg"
						: isSelected
							? "border-blue border-opacity-80"
							: isCurrent
								? "border-green border-opacity-60"
								: "border-gray border-opacity-20"
				}`}
				onClick={() => setSelectedTheme(theme)}
				onMouseEnter={() => setPreviewTheme(theme)}
				onMouseLeave={() => setPreviewTheme(null)}
				style={{
					backgroundColor: theme.windowColor,
					backgroundImage: `linear-gradient(135deg, ${theme.backgroundColor}99 0%, ${theme.windowColor} 100%)`
				}}>
				{isCurrent && (
					<div className="absolute top-2 right-2">
						<Icon icon="mdi:check-circle" className="text-green text-xl" />
					</div>
				)}

				<div className="space-y-3">
					<h3 className="font-semibold text-lg mb-2" style={{ color: theme.textColor }}>
						{theme.name}
					</h3>

					<div className="grid grid-cols-2 gap-2">
						<ColorSwatch color={theme.red} label="Red" />
						<ColorSwatch color={theme.green} label="Green" />
						<ColorSwatch color={theme.yellow} label="Yellow" />
						<ColorSwatch color={theme.blue} label="Blue" />
						<ColorSwatch color={theme.magenta} label="Magenta" />
						<ColorSwatch color={theme.cyan} label="Cyan" />
					</div>

					<div
						className="mt-3 p-2 rounded text-xs font-mono"
						style={{
							backgroundColor: theme.backgroundColor,
							color: theme.textColor
						}}>
						<span style={{ color: theme.green }}>user</span>
						<span style={{ color: theme.gray }}>@</span>
						<span style={{ color: theme.magenta }}>browser</span>
						<span style={{ color: theme.magenta }}> ❯ </span>
						<span style={{ color: theme.textColor }}>sample text</span>
					</div>

					{isSelected && (
						<button
							onClick={(e) => {
								e.stopPropagation()
								applyTheme(theme)
							}}
							className={`w-full mt-3 px-4 py-2 rounded font-semibold transition-all hover:opacity-80`}
							style={{
								backgroundColor: theme.green,
								color: theme.backgroundColor
							}}>
							Apply Theme
						</button>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="h-full w-full overflow-y-auto p-5 scrollbar scrollbar-track-transparent scrollbar-thumb-gray scrollbar-thin">
			<div className="mb-4">
				<Prompt command="themes" />
			</div>

			{/* Controls */}
			<div className="mb-6 space-y-4">
				<div className="flex gap-4 items-center flex-wrap">
					<div className="flex gap-2">
						<button
							onClick={() => setFilter("all")}
							className={`px-4 py-2 rounded transition-all ${
								filter === "all"
									? `bg-${settings.fetch.titleColor} text-black font-semibold`
									: "bg-gray bg-opacity-20 text-gray hover:bg-opacity-30"
							}`}>
							All Themes
						</button>
						<button
							onClick={() => setFilter("dark")}
							className={`px-4 py-2 rounded transition-all ${
								filter === "dark"
									? `bg-${settings.fetch.titleColor} text-black font-semibold`
									: "bg-gray bg-opacity-20 text-gray hover:bg-opacity-30"
							}`}>
							Dark
						</button>
						<button
							onClick={() => setFilter("light")}
							className={`px-4 py-2 rounded transition-all ${
								filter === "light"
									? `bg-${settings.fetch.titleColor} text-black font-semibold`
									: "bg-gray bg-opacity-20 text-gray hover:bg-opacity-30"
							}`}>
							Light
						</button>
					</div>

					<input
						type="text"
						placeholder="Search themes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1 min-w-[200px] px-4 py-2 rounded bg-black bg-opacity-30 text-textColor outline-none border border-gray border-opacity-20 focus:border-opacity-50 transition-all"
					/>
				</div>

				<div className="text-sm text-gray">
					<p>
						Showing {filteredThemes.length} of {themes.length} themes • Hover to preview
						• Click to select • Current:{" "}
						<span className="text-green">{settings.theme.name}</span>
					</p>
				</div>
			</div>

			{/* Theme Grid */}
			{isLoading ? (
				<div className="text-center text-gray py-12">
					<Icon icon="mdi:loading" className="text-4xl animate-spin mx-auto mb-4" />
					<p>Loading themes...</p>
				</div>
			) : filteredThemes.length === 0 ? (
				<div className="text-center text-gray py-12">
					<Icon
						icon="mdi:theme-light-dark"
						className="text-4xl mx-auto mb-4 opacity-50"
					/>
					<p>No themes found matching your criteria</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredThemes.map((theme, idx) => (
						<ThemeCard key={idx} theme={theme} />
					))}
				</div>
			)}

			{/* Footer */}
			<div className="mt-8 pt-4 border-t border-gray border-opacity-20">
				<p className="text-gray text-sm">
					Press{" "}
					<code
						className={`text-${settings.fetch.titleColor} bg-black bg-opacity-30 px-2 py-1 rounded`}>
						ESC
					</code>{" "}
					to close • Themes are stored in{" "}
					<code className="bg-black bg-opacity-30 px-2 py-1 rounded">data/themes/</code>
				</p>
			</div>
		</div>
	)
}

export default ThemePreviewer
