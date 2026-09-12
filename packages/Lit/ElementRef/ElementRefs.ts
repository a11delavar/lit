import { type DirectiveResult } from '../index.js'
import { elementRefDirective, type ElementRefTarget } from './ElementRefDirective.js'
import { type ElementRefLifecycle } from './ElementRefLifecycle.js'

/**
 * The elements a template designates, each with the options it declares:
 *
 * ```ts
 * readonly swatches = new ElementRefs<HTMLElement, string>()
 * ```
 * ```html
 * ${this.colors.map(color => html`<button ${this.swatches.ref(color)}>${color}</button>`)}
 * ```
 *
 * {@link ElementRef} at the other cardinality: iterating yields the elements as `value` yields the
 * one, and {@link get} answers what an element was declared with as `options` answers it for the one.
 *
 * Elements no template can put a directive on are designated through {@link set} and {@link delete}.
 *
 * Iteration is in the order the elements were FIRST declared, so a collection whose order can change
 * orders itself by what it declared.
 */
export class ElementRefs<T extends Element = Element, TOptions = void> implements Iterable<T> {
	constructor(private readonly lifecycle: ElementRefLifecycle<T, TOptions> = {}) { }

	private readonly optionsByElement = new Map<T, TOptions>()

	/** Designates the element it is rendered on. */
	readonly ref = (options: TOptions): DirectiveResult => elementRefDirective(this as unknown as ElementRefTarget, options)

	get size() { return this.optionsByElement.size }

	[Symbol.iterator]() { return this.optionsByElement.keys() }

	has(element: T) { return this.optionsByElement.has(element) }

	/** What the element was declared with. */
	get(element: T) { return this.optionsByElement.get(element) }

	/** Designates an element by hand. */
	set(element: T, options: TOptions) {
		this.optionsByElement.set(element, options)
		this.lifecycle.updated?.(element, options)
	}

	/** Forgets an element. */
	delete(element: T) {
		if (this.optionsByElement.has(element) === false) {
			return false
		}
		const options = this.optionsByElement.get(element) as TOptions
		this.optionsByElement.delete(element)
		this.lifecycle.disconnected?.(element, options)
		return true
	}
}