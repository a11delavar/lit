import type { ReactiveElement } from 'lit'
import { decorateReactiveElement } from '../decorateReactiveElement.js'

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

export const updatedObserversSymbol = Symbol('updatedObservers')

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		decorateReactiveElement<Map<PropertyKey, UpdatedCallback<any>>>({
			prototype,
			constructorPropertyKey: updatedObserversSymbol,
			initialValue: new Map,
			lifecycleHooks: new Map([
				['updated', function (this, observers, changedProperties: Parameters<ReactiveElement['updated']>[0]) {
					for (const [propertyKey, value] of changedProperties) {
						const key = propertyKey as keyof ReactiveElement
						const observer = observers?.get(key)
						if (observer !== undefined) {
							observer.call(this, this[key], value)
						}
					}
				}]
			])
		}).set(propertyKey, callback)
	}
}