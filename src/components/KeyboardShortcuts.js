import React from "react"
import Prompt from "@/components/Prompt"
import { useSettings } from "@/context/settings"

const KeyboardShortcuts = ({ closeCallback }) => {
	const { settings } = useSettings()

	const shortcuts = [
		{
			category: "Navigation",
			items: [
				{ key: "TAB", description: "Cycle through filtered links (next)" },
				{ key: "SHIFT + TAB", description: "Cycle through filtered links (previous)" },
				{ key: "→", description: "Auto-complete suggestion" },
				{ key: "ESC", description: "Close current window" }
			]
		},
		{
			category: "Commands",
			items: [
				{ key: "ENTER", description: "Execute command or search" },
				{ key: "CTRL + ENTER", description: "Search without auto-complete" },
				{ key: "CTRL + C", description: "Clear prompt" }
			]
		},
		{
			category: "Built-in Commands",
			items: [
				{ key: "list", description: "Show all links" },
				{ key: "help", description: "Show help and search shortcuts" },
				{ key: "fetch", description: "Display system information" },
				{ key: "weather <location>", description: "Show weather for zip code or city" },
				{ key: "shortcuts", description: "Show keyboard shortcuts panel" },
				{ key: "?", description: "Alias for shortcuts command" },
				{ key: "config", description: "Configuration commands" },
				{ key: "config help", description: "Display configuration help" },
				{ key: "config edit", description: "Edit configuration" },
				{ key: "config theme", description: "List available themes" },
				{ key: "config theme <name>", description: "Switch to specified theme" },
				{ key: "config import <url>", description: "Import configuration from URL" },
				{ key: "config reset", description: "Reset to default configuration" },
				{ key: "themes", description: "Open theme previewer" },
				{ key: "lock", description: "Lock screen (requires password setup)" }
			]
		},
		{
			category: "Search Shortcuts",
			items: settings.search.shortcuts.map((shortcut) => ({
				key: `${shortcut.alias} <query>`,
				description: shortcut.name
			}))
		}
	]

	return (
		<div className="h-full w-full overflow-y-auto p-5 scrollbar scrollbar-track-transparent scrollbar-thumb-gray scrollbar-thin">
			<div className="mb-3">
				<Prompt command="shortcuts" />
			</div>

			<div className="space-y-6">
				{shortcuts.map((section, idx) => (
					<div key={idx} className="space-y-2">
						<h3
							className={`text-${settings.fetch.titleColor} font-semibold text-lg mb-3`}>
							{section.category}
						</h3>
						<div className="space-y-2">
							{section.items.map((item, itemIdx) => (
								<div key={itemIdx} className="flex items-start">
									<div className="flex-shrink-0 w-48">
										<code
											className={`text-${settings.fetch.titleColor} bg-black bg-opacity-30 px-2 py-1 rounded text-sm`}>
											{item.key}
										</code>
									</div>
									<div className="flex-1 text-gray ml-4">{item.description}</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 pt-4 border-t border-gray border-opacity-20">
				<p className="text-gray text-sm">
					Press{" "}
					<code
						className={`text-${settings.fetch.titleColor} bg-black bg-opacity-30 px-2 py-1 rounded`}>
						ESC
					</code>{" "}
					to close this panel
				</p>
			</div>
		</div>
	)
}

export default KeyboardShortcuts
