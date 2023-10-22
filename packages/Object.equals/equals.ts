Object.equals = function (a: any, b: any) {
	if (a === b) {
		return true
	}

	if (a?.equals) {
		return a.equals(b)
	}

	if (b?.equals) {
		return b.equals(a)
	}

	return false
}

export { }

declare global {
	interface ObjectConstructor {
		equals(a: unknown, b: unknown): boolean
	}
}