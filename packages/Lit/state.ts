import type { ReactiveElement } from 'lit'
import { StateDeclaration, state as litState } from 'lit/decorators.js'
import { UpdatedCallback } from './updated/lifecycleUpdateDecorator.js'
import { updated } from './updated/updated.js'
import { update } from './updated/update.js'

export const state = <T>(options?: StateDeclaration & {
	updated?: UpdatedCallback<T>
	update?: UpdatedCallback<T>
}) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}

		if (options?.update) {
			update(options.update)(prototype, propertyKey)
		}

		return litState(options)(prototype, propertyKey)
	}
}