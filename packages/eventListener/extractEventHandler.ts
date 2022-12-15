import { Part } from 'lit'

export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject): (event: TEvent) => void => {
	return (eventListener as Part).type === 5
		// @ts-expect-error - _$committedValue does actually exist on EventPart
		// eslint-disable-next-line no-restricted-syntax
		? eventListener._$committedValue.bind(eventListener.element)
		: typeof eventListener === 'function'
			? eventListener
			: eventListener.handleEvent
}