import React, { useEffect, useState, useContext } from "react"
import Head from "next/head"
import { useSettings } from "@/context/settings"
import { fetchAsset } from "@/utils/fetchAsset"

const Meta = () => {
	const [title, setTitle] = useState("Start Page")
	const [iconType, setIconType] = useState("na")
	const [icon, setIcon] = useState(null)
	const { settings } = useSettings()

	useEffect(() => {
		if (!settings) return;
		// Set title
		setTitle(settings.title ? settings.title : (settings.username ? settings.username + " Start Page" : "Start Page"))

		// Return if there is no fetch or image
		if (!settings.fetch || !settings.fetch.image) return;

		// Set icon type for favicon
		const iconExtension = settings.fetch.image.split(".").pop();
		switch (iconExtension) {
			case "svg":
				setIconType("image/svg+xml");
				break;
			case "png":
				setIconType("image/png");
				break;
			default:
				setIconType("na");
		}

		// Fetch icon image
		fetchAsset(settings.fetch.image)
			.then((data) => {
				if (data) {
					setIcon(data);
				}
			})
			.catch((error) => {
				console.error("Failed to fetch icon:", error);
			});
		// eslint-disable-next-line
	}, [settings && settings.fetch ? settings.fetch.image : undefined, settings && settings.username ? settings.username : undefined]);

	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={`Start page of ${settings && settings.username ? settings.username : ""}`} />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			{icon && <link rel="icon" type={iconType} href={`${icon}`} />}
			<meta name="robots" content="noindex, nofollow"></meta>
		</Head>
	)
}

export default Meta
