import { equals } from './symbol.js'

Object.prototype[equals] = function (this: object, other: unknown) {
	if (this === other) {
		return true
	}

	if (!(other instanceof Object)) {
		if (typeof other === 'object' && other !== null) {
			return this[equals](Object.assign({}, other))
		}

		return false
	}

	if (this.constructor !== other.constructor) {
		return false
	}

	if ('valueOf' in this && 'valueOf' in other && this.valueOf !== Object.prototype.valueOf && this.valueOf !== Object.prototype.valueOf) {
		return this.valueOf() === other.valueOf()
	}

	const nonUndefinedKeys = Object.keys(this).filter(key => this[key as keyof typeof this] !== undefined)
	const otherNonUndefinedKeys = Object.keys(other).filter(key => other[key as keyof typeof other] !== undefined)

	if (nonUndefinedKeys.length !== otherNonUndefinedKeys.length) {
		return false
	}

	for (const [key, value] of Object.entries(this)) {
		if (value === undefined) {
			continue
		}

		if (!Object.prototype.hasOwnProperty.call(other, key)) {
			return false
		}

		if (!Object[equals](value, (other as any)[key])) {
			return false
		}
	}

	return true
}

export { }

declare global {
	interface Object {
		[equals](other: unknown): boolean
	}
}