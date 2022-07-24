import { PropertyDeclaration, LitElement } from 'lit'
import { property as litProperty } from 'lit/decorators.js'
import { updated, UpdatedCallback } from './updated'

export const property = <T>(options?: PropertyDeclaration & { updated?: UpdatedCallback<T> }) => {
	return (prototype: LitElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		return litProperty(options)(prototype, propertyKey)
	}
}