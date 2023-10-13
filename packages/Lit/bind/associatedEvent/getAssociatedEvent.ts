import { associatedEventsByPropertiesKey } from './associatedEvent.js'
import { HTMLElementEventDispatcher } from '../../event/HTMLElementEventDispatcher.js'

export function getAssociatedEvent(element: Element, property: string) {
	const associatedEventsByProperties = (element.constructor as any)[associatedEventsByPropertiesKey]
	const explicitlyAssociatedEvent = associatedEventsByProperties?.get(property) as string | undefined
	if (explicitlyAssociatedEvent) {
		return explicitlyAssociatedEvent
	}

	const eventDispatcherKey = `${property}Change`
	const eventDispatcher = (element as any)[eventDispatcherKey]
	if (eventDispatcher instanceof HTMLElementEventDispatcher) {
		return eventDispatcherKey
	}

	return 'change'
}