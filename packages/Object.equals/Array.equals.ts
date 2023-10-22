Array.prototype.equals = function (this: Array<unknown>, other: unknown) {
	if (this === other) {
		return true
	}

	if (!(other instanceof Array)) {
		return false
	}

	if (this.length !== other.length) {
		return false
	}

	for (const index in this) {
		if (Object.equals(this[index], other[index]) === false) {
			return false
		}
	}

	return true
}

export { }

declare global {
	interface Array<T> {
		equals(other: Array<T>): boolean
	}
}