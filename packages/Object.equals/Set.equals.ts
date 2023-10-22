Set.prototype.equals = function (this: Set<unknown>, other: unknown) {
	if (this === other) {
		return true
	}

	if (!(other instanceof Set)) {
		return false
	}

	if (this.size !== other.size) {
		return false
	}

	return [...this].equals([...other])
}

export { }

declare global {
	interface Set<T> {
		equals(other: Set<T>): boolean
	}
}