import { PartType } from 'lit/async-directive.js'

interface EventPart {
	readonly type: typeof PartType.EVENT
	readonly element: Element
	readonly options?: { readonly host?: object }
	/** The bound listener in Lit's development build. */
	readonly _$committedValue?: EventListenerOrEventListenerObject
	/** The bound listener in Lit's production build, which minifies `_$committedValue`. */
	readonly _$AH?: EventListenerOrEventListenerObject
}

const isEventPart = (eventListener: object): eventListener is EventPart =>
	'type' in eventListener && eventListener.type === PartType.EVENT && 'element' in eventListener

/** The function an event listener runs, which for a template's event binding also passes on what the bound function returns. */
export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject): (event: TEvent) => unknown => {
	if (typeof eventListener === 'function') {
		return eventListener
	}
	if (isEventPart(eventListener)) {
		const listener = eventListener._$committedValue ?? eventListener._$AH
		return typeof listener === 'function'
			? listener.bind(eventListener.options?.host ?? eventListener.element)
			: listener?.handleEvent.bind(listener) ?? (() => undefined)
	}
	return eventListener.handleEvent
}