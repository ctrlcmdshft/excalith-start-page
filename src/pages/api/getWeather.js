export default async function handler(req, res) {
	const apiKey = process.env.WEATHER_API_KEY

	if (!apiKey) {
		return res.status(500).json({
			error: "Weather API key not configured. Set WEATHER_API_KEY environment variable."
		})
	}

	const { location, lat, lon } = req.query

	try {
		let weatherUrl

		if (lat && lon) {
			// Use coordinates from geolocation
			weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
		} else if (location) {
			// Check if location is a zip code (US format)
			const isZipCode = /^\d{5}(-\d{4})?$/.test(location)

			if (isZipCode) {
				weatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${location},US&appid=${apiKey}&units=imperial`
			} else {
				// Treat as city name
				weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
					location
				)}&appid=${apiKey}&units=imperial`
			}
		} else {
			return res.status(400).json({
				error: "Please provide a location or enable geolocation"
			})
		}

		const response = await fetch(weatherUrl)
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.message || "Failed to fetch weather data")
		}

		// Format the response
		const weatherInfo = {
			location: `${data.name}, ${data.sys.country}`,
			temp: Math.round(data.main.temp),
			feelsLike: Math.round(data.main.feels_like),
			humidity: data.main.humidity,
			pressure: data.main.pressure,
			windSpeed: Math.round(data.wind.speed),
			visibility: Math.round(data.visibility / 1609.34), // Convert meters to miles
			weather: data.weather[0].main,
			description: data.weather[0].description,
			icon: data.weather[0].icon
		}

		res.status(200).json(weatherInfo)
	} catch (error) {
		console.error("Weather API error:", error)
		res.status(500).json({
			error: error.message || "Failed to fetch weather data"
		})
	}
}
