import { _$LH as LitInternals } from 'lit'

const EventPart = LitInternals._EventPart ?? (LitInternals as any)['I']

Object.defineProperty(EventPart.prototype, 'handler', {
	get(this) {
		return '_$committedValue' in this
			? this._$committedValue
			: '_$AH' in this
				? this._$AH
				: undefined
	}
})

export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject): (event: TEvent) => void => {
	return eventListener instanceof EventPart
		? (eventListener as any).handler?.bind(eventListener.element) ?? (() => { })
		: typeof eventListener === 'function'
			? eventListener
			: eventListener.handleEvent
}