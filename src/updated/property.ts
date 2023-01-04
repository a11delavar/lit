import type { PropertyDeclaration, ReactiveElement } from 'lit'
import { property as litProperty } from 'lit/decorators.js'
import { updated, UpdatedCallback } from './updated.js'

export const property = <T>(options?: PropertyDeclaration & { updated?: UpdatedCallback<T> }) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		return litProperty(options)(prototype, propertyKey)
	}
}