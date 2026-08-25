import { host } from '../../host.js'
import { findAssociatedEvent, findAssociatedEventDispatcher } from './getAssociatedEvent.js'

/**
 * Dispatches the event associated with a property *on the source itself*, so that whoever observes
 * the source - and not whoever happens to sit inside of it - is notified of the change.
 *
 * The event is dispatched through the associated `EventDispatcher` whenever there is one, so that
 * the DOM event type and the `EventInit` declared via `@event()` are honored. Sources which only
 * declare an association without a dispatcher fall back to a `CustomEvent` on their host element.
 *
 * @returns Whether an associated event could be resolved and dispatched.
 */
export function dispatchAssociatedEvent(source: object, property: PropertyKey, value: unknown) {
	const dispatcher = findAssociatedEventDispatcher(source, property)

	if (dispatcher) {
		dispatcher.dispatch(value)
		return true
	}

	const event = findAssociatedEvent(source, property)
	const element = (source as Partial<Record<typeof host, unknown>>)[host]

	if (event && element instanceof EventTarget) {
		element.dispatchEvent(new CustomEvent(event, { detail: value }))
		return true
	}

	return false
}
