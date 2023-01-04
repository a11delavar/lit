import type { ReactiveElement } from 'lit'
import { InternalPropertyDeclaration, state as litState } from 'lit/decorators.js'
import { updated, UpdatedCallback } from './updated.js'

export const state = <T>(options?: InternalPropertyDeclaration & { updated?: UpdatedCallback<T> }) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		return litState(options)(prototype, propertyKey)
	}
}