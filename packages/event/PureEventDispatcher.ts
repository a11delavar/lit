export class PureEventDispatcher<T = void> implements EventDispatcher<T> {
	private readonly handlers = new Set<EventHandler<T>>()

	subscribe(handler: EventHandler<T>) {
		this.handlers.add(handler)
	}

	unsubscribe(handler: EventHandler<T>) {
		this.handlers.delete(handler)
	}

	dispatch(data: T) {
		for (const handler of this.handlers) {
			handler(data)
		}
	}
}