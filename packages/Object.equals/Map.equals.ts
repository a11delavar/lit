
Map.prototype.equals = function (this: Map<unknown, unknown>, other: unknown) {
	if (this === other) {
		return true
	}

	if (!(other instanceof Map)) {
		return false
	}

	if (this.size !== other.size) {
		return false
	}

	for (const [key, value] of this) {
		if (!other.has(key)) {
			return false
		}

		if (Object.equals(value, other.get(key)) === false) {
			return false
		}
	}

	return true
}

export { }

declare global {
	interface Map<K, V> {
		equals(other: Map<K, V>): boolean
	}
}