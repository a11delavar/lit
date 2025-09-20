import { equals } from './symbol.js'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
Function.prototype[equals] = function (this: Function, other: unknown) {
	if (this === other) {
		return true
	}


	if (!(other instanceof Function)) {
		return false
	}

	return this.toString() === other.toString()
}

export { }

declare global {
	interface Function {
		[equals](other: Function): boolean
	}
}