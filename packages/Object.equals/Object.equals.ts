Object.prototype.equals = function (this: object, other: unknown) {
	if (this === other) {
		return true
	}

	if (!(other instanceof Object)) {
		return false
	}

	if (this.constructor !== other.constructor) {
		return false
	}

	if ('valueOf' in this && 'valueOf' in other && this.valueOf !== Object.prototype.valueOf && this.valueOf !== Object.prototype.valueOf) {
		return this.valueOf() === other.valueOf()
	}

	if (Object.keys(this).length !== Object.keys(other).length) {
		return false
	}

	for (const [key, value] of Object.entries(this)) {
		if (!Object.prototype.hasOwnProperty.call(other, key)) {
			return false
		}

		if (!Object.equals(value, (other as any)[key])) {
			return false
		}
	}

	return true
}

export { }

declare global {
	interface Object {
		equals(other: unknown): boolean
	}
}