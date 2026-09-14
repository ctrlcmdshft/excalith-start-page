import { useEffect, useMemo, useState } from "react"

const weatherLabels = {
	0: ["Clear", "☀"],
	1: ["Mostly clear", "🌤"],
	2: ["Partly cloudy", "⛅"],
	3: ["Overcast", "☁"],
	45: ["Foggy", "🌫"],
	48: ["Foggy", "🌫"],
	51: ["Drizzle", "🌦"],
	53: ["Drizzle", "🌦"],
	55: ["Drizzle", "🌦"],
	61: ["Rain", "🌧"],
	63: ["Rain", "🌧"],
	65: ["Heavy rain", "🌧"],
	71: ["Snow", "🌨"],
	73: ["Snow", "🌨"],
	75: ["Heavy snow", "🌨"],
	80: ["Showers", "🌦"],
	81: ["Showers", "🌦"],
	82: ["Heavy showers", "🌧"],
	95: ["Storms", "⛈"],
	96: ["Storms", "⛈"],
	99: ["Storms", "⛈"]
}

const getLocationLabel = () => {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time"
	return timezone.split("/").pop().replaceAll("_", " ")
}

const StatusIsland = () => {
	const [now, setNow] = useState(null)
	const [weather, setWeather] = useState(null)
	const [weatherError, setWeatherError] = useState(false)
	const location = useMemo(() => getLocationLabel(), [])

	useEffect(() => {
		const updateTime = () => setNow(new Date())
		updateTime()
		const timer = window.setInterval(updateTime, 30_000)
		return () => window.clearInterval(timer)
	}, [])

	useEffect(() => {
		if (!navigator.geolocation) {
			setWeatherError(true)
			return
		}

		navigator.geolocation.getCurrentPosition(
			async ({ coords }) => {
				try {
					const params = new URLSearchParams({
						latitude: coords.latitude,
						longitude: coords.longitude,
						current: "temperature_2m,weather_code",
						temperature_unit: "fahrenheit",
						forecast_days: "1"
					})
					const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
					if (!response.ok) throw new Error("Weather request failed")
					const data = await response.json()
					setWeather({
						temperature: Math.round(data.current.temperature_2m),
						code: data.current.weather_code
					})
				} catch {
					setWeatherError(true)
				}
			},
			() => setWeatherError(true),
			{ maximumAge: 900_000, timeout: 5_000 }
		)
	}, [])

	const weatherInfo = weatherLabels[weather?.code] || ["Weather unavailable", "·"]

	return (
		<aside
			className="fixed top-4 right-4 z-20 rounded-terminal bg-window-color px-4 py-2 text-right shadow-lg"
			aria-label="Local time and weather">
			<div className="text-lg text-textColor tabular-nums">
				{now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--:--"}
			</div>
			<div className="text-xs text-gray">
				{weather && `${weatherInfo[1]} ${weather.temperature}°F · `}
				{weatherError && !weather ? "Weather unavailable · " : ""}
				{location}
			</div>
		</aside>
	)
}

export default StatusIsland
