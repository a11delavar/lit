import { notEqual, ReactiveElement } from 'lit'
import { type StateDeclaration, state as litState } from 'lit/decorators.js'
import { updated } from './updated/updated.js'
import { type UpdatedCallback } from './updated/UpdatedController.js'
import { type Controller } from './Controller/Controller.js'
import { requestHostUpdate } from './updated/requestHostUpdate.js'

export const state = <T>(options?: StateDeclaration & { updated?: UpdatedCallback<T> }) => {
	return (prototype: ReactiveElement | Controller, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}
		return prototype instanceof ReactiveElement
			? litState(options)(prototype, propertyKey)
			: controllerState(options)(prototype, propertyKey)
	}
}

/**
 * As a controller's properties do not exist on its host, they cannot be registered as reactive
 * properties of it. They are instead stored on the controller itself and request an update
 * of the host whenever they change.
 */
const controllerState = (options?: StateDeclaration) => {
	return (prototype: Controller, propertyKey: PropertyKey) => {
		const valueKey = Symbol(String(propertyKey))
		const hasChanged = options?.hasChanged ?? notEqual
		Object.defineProperty(prototype, propertyKey, {
			configurable: true,
			enumerable: true,
			get(this: any) {
				return this[valueKey]
			},
			set(this: any, value: unknown) {
				const oldValue = this[valueKey]
				this[valueKey] = value
				if (hasChanged(value, oldValue)) {
					requestHostUpdate(this, propertyKey, oldValue)
				}
			},
		})
	}
}