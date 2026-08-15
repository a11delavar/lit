import { ReactiveElement } from 'lit'

/**
 * The symbol resolving the `ReactiveElement` which owns the update lifecycle of a given context.
 *
 * A `ReactiveElement` resolves to itself, while a `Controller` resolves to its host, which allows
 * decorators such as `state`, `query`, `queryAll`, `event`, `eventListener` and `updated` to behave
 * identically regardless of whether they are applied on a component or on a controller.
 */
export const host = Symbol('host')

export interface HostProvider {
	readonly [host]: ReactiveElement
}

declare module '@lit/reactive-element' {
	interface ReactiveElement {
		readonly [host]: ReactiveElement
	}
}

Object.defineProperty(ReactiveElement.prototype, host, {
	configurable: true,
	get(this: ReactiveElement) { return this },
})