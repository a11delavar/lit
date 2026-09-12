/** The lifecycle of the element or elements a reference holds. */
export interface ElementRefLifecycle<T extends Element = Element, TOptions = void> {
	/** The element was declared — on every render of its part and on every `set`. Runs during the host's render. */
	updated?(element: T, options: TOptions): void
	/** The element left, with the options it last had. */
	disconnected?(element: T, options: TOptions): void
}