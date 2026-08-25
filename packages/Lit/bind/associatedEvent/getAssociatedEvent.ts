import { associatedEventsByPropertiesKey } from './associatedEvent.js'
import { HTMLElementEventDispatcher } from '../../event/HTMLElementEventDispatcher.js'

/** The event associated with a property when neither an explicit nor an implicit association can be found. */
export const defaultAssociatedEvent = 'change'

function getExplicitlyAssociatedEvent(source: object, property: PropertyKey) {
	const associatedEventsByProperties = (source.constructor as any)?.[associatedEventsByPropertiesKey]
	return associatedEventsByProperties?.get(property) as string | undefined
}

function *getCandidateDispatcherKeys(source: object, property: PropertyKey) {
	const explicitlyAssociatedEvent = getExplicitlyAssociatedEvent(source, property)

	if (explicitlyAssociatedEvent) {
		yield explicitlyAssociatedEvent
		return
	}

	yield `${String(property)}Change`

	if (property === 'value') {
		yield defaultAssociatedEvent
	}
}

/**
 * Resolves the `EventDispatcher` associated with a property, or `undefined` if there is none.
 *
 * Dispatching through the dispatcher rather than through a hand-made event preserves both the
 * DOM event type and the `EventInit` the dispatcher has been declared with.
 */
export function findAssociatedEventDispatcher(source: object, property: PropertyKey) {
	for (const key of getCandidateDispatcherKeys(source, property)) {
		const dispatcher = (source as any)[key]
		if (dispatcher instanceof HTMLElementEventDispatcher) {
			return dispatcher
		}
	}

	return undefined
}

/**
 * Resolves the event associated with a property, or `undefined` if no association can be found.
 *
 * Unlike `getAssociatedEvent` this does not fall back to the default associated event, which makes
 * it the resolution to use whenever an event is *dispatched* - falling back would dispatch a
 * `change` event for every property which merely happens to have no association.
 */
export function findAssociatedEvent(source: object, property: PropertyKey) {
	return findAssociatedEventDispatcher(source, property)?.type
		?? getExplicitlyAssociatedEvent(source, property)
}

/**
 * Resolves the event associated with a property, falling back to the default associated event.
 *
 * This is the resolution to use whenever an event is *listened* to, as a listener always has to be
 * attached to some event.
 */
export function getAssociatedEvent(source: object, property: PropertyKey) {
	return findAssociatedEvent(source, property) ?? defaultAssociatedEvent
}
