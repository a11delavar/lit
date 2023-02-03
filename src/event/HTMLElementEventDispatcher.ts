type CustomEventHandler<T> = (event: CustomEvent<T>) => void

export class HTMLElementEventDispatcher<T = void> implements EventDispatcher<T> {
	private readonly handlersMap = new Map<EventHandler<T>, CustomEventHandler<T>>()

	constructor(
		private readonly element: HTMLElement,
		private readonly type: string,
		private readonly options?: EventInit,
	) { }

	dispatch(value: T | CustomEvent<T>) {
		this.element.dispatchEvent(
			value instanceof CustomEvent
				? value
				: new CustomEvent<T>(this.type, { detail: value, ...this.options })
		)
	}

	subscribe(handler: EventHandler<T>) {
		if (this.handlersMap.has(handler) === false) {
			const nativeHandler = (event: CustomEvent<T>) => handler(event.detail)
			this.element.addEventListener(this.type, nativeHandler as EventListener)
			this.handlersMap.set(handler, nativeHandler)
		}
	}

	unsubscribe(handler: EventHandler<T>) {
		const nativeHandler = this.handlersMap.get(handler)
		if (nativeHandler) {
			this.element.removeEventListener(this.type, nativeHandler as EventListener)
		}
		this.handlersMap.delete(handler)
	}
}