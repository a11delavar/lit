import { PartType } from 'lit/async-directive.js'

export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject): (event: TEvent) => void => {
	return typeof eventListener === 'function'
		? eventListener
		: 'type' in eventListener && '_$AH' in eventListener && 'element' in eventListener && eventListener.type === PartType.EVENT
			? (eventListener['_$AH'] as (event: TEvent) => void).bind(eventListener.element)
			: eventListener.handleEvent
}