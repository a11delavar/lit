import type { EventPart } from 'packages'

export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject) => {
	if ('_$committedValue' in eventListener) {
		const eventPart = eventListener as EventPart
		const handler = eventListener['_$committedValue'] as (event: TEvent) => void
		// eslint-disable-next-line no-restricted-syntax
		return handler.bind(eventPart.element)
	}
	return typeof eventListener === 'function' ? eventListener : eventListener.handleEvent
}