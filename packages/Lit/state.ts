import type { ReactiveElement } from 'lit'
import { StateDeclaration, state as litState } from 'lit/decorators.js'
import { updated } from './updated/updated.js'
import { UpdatedCallback } from 'updated/UpdatedController.js'

export const state = <T>(options?: StateDeclaration & { updated?: UpdatedCallback<T> }) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		return litState(options)(prototype, propertyKey)
	}
}