import type { PropertyDeclaration, ReactiveElement } from 'lit'
import { property as litProperty } from 'lit/decorators.js'
import { updated, UpdatedCallback } from './updated.js'
import { associatedEvent } from '../bind/index.js'

export const property = <T>(options?: PropertyDeclaration & {
	updated?: UpdatedCallback<T>
	event?: string
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		if (options?.event) {
			associatedEvent(options.event)(prototype, propertyKey)
		}

		return litProperty(options)(prototype, propertyKey)
	}
}