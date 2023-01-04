declare global {
	export type EventHandler<T> = (data: T) => void

	export interface EventDispatcher<T = void> {
		dispatch(value: T): void
		subscribe(handler: EventHandler<T>): void
		unsubscribe(handler: EventHandler<T>): void
	}
}