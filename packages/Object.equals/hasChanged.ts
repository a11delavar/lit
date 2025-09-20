import { equals } from './symbol.js'

/**
 * A helper function usually used with Lit \@property's "hasChanged" option to
 * replace the default identity check with an equality check.
 */
export function hasChanged(value: unknown, oldValue: unknown): boolean {
	return !Object[equals](value, oldValue)
}