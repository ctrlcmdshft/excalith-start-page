import Prompt from "@/components/Prompt"
import { useSettings } from "@/context/settings"

const Help = ({ closeCallback }) => {
	const { settings } = useSettings()

	const helpSections = [
		{
			category: "Usage",
			items: [
				{ command: "", description: "Filter links by typing in the prompt" },
				{
					command: "",
					description: "Unfiltered prompt will search using default search engine"
				},
				{ command: "", description: "Launch URLs directly (http://, https://) in new tab" },
				{ command: "", description: "Type commands to access built-in features" }
			]
		},
		{
			category: "Key Bindings",
			items: [
				{ command: "→", description: "Auto-complete suggestion" },
				{ command: "TAB", description: "Cycle through filtered links (next)" },
				{ command: "SHIFT + TAB", description: "Cycle through filtered links (previous)" },
				{ command: "ENTER", description: "Execute command or search" },
				{ command: "CTRL + ENTER", description: "Search without auto-complete" },
				{ command: "CTRL + C", description: "Clear prompt" },
				{ command: "ESC", description: "Close current window" }
			]
		},
		{
			category: "Built-in Commands",
			items: [
				{ command: "list", description: "Show all links" },
				{ command: "help", description: "Show help and search shortcuts" },
				{ command: "fetch", description: "Display system information" },
				{ command: "weather <location>", description: "Show weather for zip code or city" },
				{ command: "shortcuts", description: "Show keyboard shortcuts panel" },
				{ command: "?", description: "Alias for shortcuts command" },
				{ command: "config", description: "Configuration commands" },
				{ command: "config help", description: "Display configuration help" },
				{ command: "config edit", description: "Edit configuration" },
				{ command: "config theme", description: "List available themes" },
				{ command: "config theme <name>", description: "Switch to specified theme" },
				{ command: "config import <url>", description: "Import configuration from URL" },
				{ command: "config reset", description: "Reset to default configuration" },
				{ command: "themes", description: "Open theme previewer" },
				{ command: "lock", description: "Lock screen (requires password setup)" }
			]
		},
		{
			category: "Password Protection",
			items: [
				{ command: "lock", description: "Lock the screen" },
				{ command: "", description: "• Session persists until browser closes (default)" },
				{ command: "", description: "• Optional: Remember authentication for 7 days" },
				{ command: "", description: "• 5 failed login attempts triggers 5 minute lockout" },
				{ command: "", description: "• Uses SHA-256 password hashing for security" }
			]
		},
		{
			category: "Tips",
			items: [
				{
					command: "",
					description: "• Real-time filtering narrows down links as you type"
				},
				{ command: "", description: "• Use search shortcuts (below) for quick searches" },
				{
					command: "",
					description: "• Theme previewer shows live color swatches and preview"
				},
				{ command: "", description: "• Config can be imported from remote JSON URLs" }
			]
		}
	]

	return (
		<div className="h-full w-full overflow-y-auto p-5 scrollbar scrollbar-track-transparent scrollbar-thumb-gray scrollbar-thin">
			<div className="mb-3">
				<Prompt command="help" />
			</div>

			<div className="space-y-6">
				{helpSections.map((section, idx) => (
					<div key={idx} className="space-y-2">
						<h3
							className={`text-${settings.fetch.titleColor} font-semibold text-lg mb-3`}>
							{section.category}
						</h3>
						<div className="space-y-2">
							{section.items.map((item, itemIdx) => (
								<div key={itemIdx} className="flex items-start">
									{item.command ? (
										<>
											<div className="flex-shrink-0 w-48">
												<code
													className={`text-${settings.fetch.titleColor} bg-black bg-opacity-30 px-2 py-1 rounded text-sm`}>
													{item.command}
												</code>
											</div>
											<div className="flex-1 text-gray ml-4">
												{item.description}
											</div>
										</>
									) : (
										<div className="text-gray">{item.description}</div>
									)}
								</div>
							))}
						</div>
					</div>
				))}

				<div className="space-y-2">
					<h3 className={`text-${settings.fetch.titleColor} font-semibold text-lg mb-3`}>
						Search Shortcuts
					</h3>
					<div className="space-y-2">
						{settings.search.shortcuts.map((cmd, index) => (
							<div key={index} className="flex items-start">
								<div className="flex-shrink-0 w-48">
									<code
										className={`text-${settings.fetch.titleColor} bg-black bg-opacity-30 px-2 py-1 rounded text-sm`}>
										{cmd.alias} &lt;query&gt;
									</code>
								</div>
								<div className="flex-1 text-gray ml-4">{cmd.name}</div>
							</div>
						))}
					</div>
				</div>
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

export default Help
