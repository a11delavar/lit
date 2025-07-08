import { type ReactiveElement } from 'lit'

export const associatedEventsByPropertiesKey = Symbol('associatedEventsByPropertiesKey')

export function associatedEvent(event: string) {
	return (target: ReactiveElement, propertyKey: PropertyKey) => {
		const constructor = target.constructor as any
		constructor[associatedEventsByPropertiesKey] ??= new Map<string, string>()
		constructor[associatedEventsByPropertiesKey].set(propertyKey, event)
	}
}