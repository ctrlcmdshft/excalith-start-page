export function fuzzyScore(query, value) {
	const needle = query.toLowerCase().replace(/\s+/g, "")
	const haystack = value.toLowerCase()
	if (!needle) return 0

	let cursor = 0
	let score = 0
	let previous = -2
	for (const character of needle) {
		const index = haystack.indexOf(character, cursor)
		if (index === -1) return null
		score += index === previous + 1 ? 0 : 2
		score += index
		previous = index
		cursor = index + 1
	}
	return score
}
