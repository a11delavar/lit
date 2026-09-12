import { type DirectiveResult } from '../index.js'
import { elementRefDirective, type ElementRefTarget } from './ElementRefDirective.js'
import { type ElementRefLifecycle } from './ElementRefLifecycle.js'

/**
 * A single element, designated by the template and read back wherever it is needed:
 *
 * ```ts
 * readonly dialog = new ElementRef<HTMLDialogElement>()
 * ```
 * ```html
 * <dialog ${this.dialog.ref()}>
 * ```
 *
 * It is a lit `Ref`, so lit's own `ref` directive fills it too — without options. What it adds is the
 * {@link options} the template declares alongside the element, and an {@link ElementRefLifecycle}.
 *
 * An element no template can put a directive on is designated through {@link set} and {@link delete}.
 *
 * @see ElementRefs for many elements.
 */
export class ElementRef<T extends Element = Element, TOptions = void> {
	constructor(private readonly lifecycle: ElementRefLifecycle<T, TOptions> = {}) { }

	private _value?: T
	/** The designated element. */
	get value() { return this._value }
	set value(element: T | undefined) {
		this.set(element, undefined as unknown as TOptions)
	}

	private _options?: TOptions
	/** What the element was declared with. */
	get options() { return this._options }

	/** Designates the element it is rendered on. */
	readonly ref = (options: TOptions): DirectiveResult => elementRefDirective(this as unknown as ElementRefTarget, options)

	/** Designates the element by hand. `undefined` forgets the current one. */
	set(element: T | undefined, options: TOptions) {
		const previous = this._value
		const previousOptions = this._options as TOptions
		if (previous !== undefined && previous !== element) {
			this._value = undefined
			this._options = undefined
			this.lifecycle.disconnected?.(previous, previousOptions)
		}
		if (element !== undefined) {
			this._value = element
			this._options = options
			this.lifecycle.updated?.(element, options)
		}
	}

	/** Forgets the element, if it is the current one. */
	delete(element: T) {
		if (this._value !== element) {
			return false
		}
		const options = this._options as TOptions
		this._value = undefined
		this._options = undefined
		this.lifecycle.disconnected?.(element, options)
		return true
	}
}