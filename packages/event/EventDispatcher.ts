/* eslint-disable @typescript-eslint/no-unused-vars */
type EventHandler<T> = (data: T) => void

interface EventDispatcher<T = void> {
	dispatch(value: T): void
	subscribe(handler: EventHandler<T>): void
	unsubscribe(handler: EventHandler<T>): void
}