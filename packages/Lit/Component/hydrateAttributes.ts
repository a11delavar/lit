import { isServer, nothing } from 'lit'
import { _$LH } from 'lit-html/private-ssr-support.js'

/**
 * Makes hydration write the attributes the browser renders differently from the server.
 *
 * Lit's hydration only records what its first render gives an attribute and trusts the server's value, to spare the DOM writes.
 * A value only the browser knows, or one an element directive such as `bind()` writes into a child before the child hydrates,
 * therefore stays as the server rendered it. Writing those lets the browser's first render win for attributes.
 * Text and template choices stay trusted, so they must still match the server's.
 *
 * Lit has not decided how to treat such mismatches (https://github.com/lit/lit/issues/1434); this stands in until it does.
 */

type AttributePart = InstanceType<typeof _$LH.AttributePart>
type SetValue = (this: AttributePart, value: unknown, directiveParent?: unknown, valueIndex?: number, noCommit?: boolean) => void

// Lit's hydration support announces itself through this global ahead of any element, so a page which never hydrates is left alone
if (!isServer && 'litElementHydrateSupport' in globalThis) {
	const { AttributePart, BooleanAttributePart } = _$LH
	// Lit's production build mangles these two names to stable ones, by which its hydration package calls them as well
	const setValueKey = ['_$setValue', '_$AI'].find(key => key in AttributePart.prototype)
	if (!setValueKey) {
		throw new Error('Hydration cannot write attributes, as this version of lit-html has renamed AttributePart.prototype._$setValue')
	}
	const committedValueKey = setValueKey === '_$setValue' ? '_$committedValue' : '_$AH'
	const prototype = AttributePart.prototype as unknown as Record<string, SetValue>
	const recorded = (part: AttributePart) => (part as unknown as Record<string, unknown>)[committedValueKey]
	const setValue = prototype[setValueKey]!

	/** Writes the value as a render would, sparing the writes which would change nothing. */
	const commit = (part: AttributePart, value: unknown) => {
		const { element, name } = part
		if (part instanceof BooleanAttributePart) {
			element.toggleAttribute(name, !!value && value !== nothing)
		} else if (value === nothing) {
			element.removeAttribute(name)
		} else if (element.getAttribute(name) !== String(value ?? '')) {
			element.setAttribute(name, String(value ?? ''))
		}
	}

	prototype[setValueKey] = function (value, directiveParent, valueIndex, noCommit) {
		if (noCommit !== true) {
			return setValue.call(this, value, directiveParent, valueIndex, noCommit)
		}
		// Hydration passes "noCommit" to only record what a render would write. A render writes no initial "nothing", so the
		// server's attribute stays, as it may be the element's own reflected default; an interpolation always records.
		const { strings } = this
		const before = recorded(this)
		setValue.call(this, value, directiveParent, valueIndex, noCommit)
		const after = recorded(this)
		if (strings || after !== before) {
			const values = after as Array<unknown>
			commit(this, !strings ? after : values.includes(nothing) ? nothing : strings.reduce((text, string, i) => `${text}${values[i - 1] ?? ''}${string}`))
		}
	}
}
