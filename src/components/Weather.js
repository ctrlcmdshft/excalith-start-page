import Prompt from "@/components/Prompt"
import { useState, useEffect } from "react"
import { useSettings } from "@/context/settings"
import Image from "next/image"

const Weather = ({ closeCallback, location }) => {
	const { settings } = useSettings()
	const [weatherData, setWeatherData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		fetchWeather()
		// eslint-disable-next-line
	}, [location])

	const fetchWeather = async () => {
		try {
			setLoading(true)
			setError(null)

			let endpoint

			if (location) {
				endpoint = `/api/getWeather?location=${encodeURIComponent(location)}`
			} else {
				// Get current location using browser geolocation
				if (!navigator.geolocation) {
					throw new Error("Geolocation is not supported by your browser")
				}

				const position = await new Promise((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject)
				})

				const { latitude, longitude } = position.coords
				endpoint = `/api/getWeather?lat=${latitude}&lon=${longitude}`
			}

			const response = await fetch(endpoint)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch weather data")
			}

			setWeatherData(data)
		} catch (err) {
			if (err.code === 1) {
				setError(
					"Location access denied. Please allow location access or provide a location."
				)
			} else if (err.code === 2) {
				setError("Location unavailable. Please provide a location manually.")
			} else if (err.code === 3) {
				setError("Location request timeout. Please provide a location manually.")
			} else {
				setError(err.message)
			}
		} finally {
			setLoading(false)
		}
	}

	const getWeatherIconUrl = (iconCode) => {
		return `https://openweathermap.org/img/wn/${iconCode}@4x.png`
	}

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex-1 overflow-y-auto p-5 scrollbar scrollbar-track-transparent scrollbar-thumb-gray scrollbar-thin">
				<div className="mb-3">
					<Prompt command={location ? `weather ${location}` : "weather"} />
				</div>

				<div className="text-textColor">
					{loading && (
						<div className="text-gray">
							<p>Loading weather data...</p>
						</div>
					)}

					{error && (
						<div className="text-red">
							<p className="mb-2">Error: {error}</p>
							<p className="text-gray text-sm">
								Make sure WEATHER_API_KEY is set in your environment variables.
							</p>
							<p className="text-gray text-sm mt-1">
								Get a free API key at:{" "}
								<a
									href="https://openweathermap.org/api"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue">
									openweathermap.org/api
								</a>
							</p>
						</div>
					)}

					{weatherData && !loading && !error && (
						<div className="space-y-4">
							<div className="flex items-center space-x-6">
								<div className="flex-shrink-0 w-48 h-48 relative">
									<Image
										src={getWeatherIconUrl(weatherData.icon)}
										alt={weatherData.weather}
										fill
										className="object-contain"
										unoptimized
									/>
								</div>
								<div className="flex-1">
									<h2
										className={`text-${settings.fetch.titleColor} text-2xl font-semibold`}>
										{weatherData.location}
									</h2>
									<p className="text-gray text-lg">{weatherData.weather}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 mt-4">
								<div className="space-y-2">
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Temperature:{" "}
										</span>
										<span className="text-gray">{weatherData.temp}°F</span>
									</div>
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Feels Like:{" "}
										</span>
										<span className="text-gray">{weatherData.feelsLike}°F</span>
									</div>
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Humidity:{" "}
										</span>
										<span className="text-gray">{weatherData.humidity}%</span>
									</div>
								</div>
								<div className="space-y-2">
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Wind:{" "}
										</span>
										<span className="text-gray">
											{weatherData.windSpeed} mph
										</span>
									</div>
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Pressure:{" "}
										</span>
										<span className="text-gray">
											{weatherData.pressure} hPa
										</span>
									</div>
									<div>
										<span className={`text-${settings.fetch.titleColor}`}>
											Visibility:{" "}
										</span>
										<span className="text-gray">
											{weatherData.visibility} mi
										</span>
									</div>
								</div>
							</div>

							{weatherData.description && (
								<div className="pt-4 border-t border-gray border-opacity-20">
									<p className="text-gray italic">{weatherData.description}</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="flex-shrink-0 p-5 pt-4 border-t border-gray border-opacity-20">
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

export default Weather
