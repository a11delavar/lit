import { LitElement } from 'lit'
import { decorateLitElement } from '../decorateLitElement'

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: LitElement, propertyKey: PropertyKey) => {
		decorateLitElement<Map<PropertyKey, UpdatedCallback<any>>>({
			prototype,
			constructorPropertyName: '$observers$',
			initialValue: new Map,
			lifecycleHooks: new Map([
				['updated', function (this, observers, changedProperties: Parameters<LitElement['updated']>[0]) {
					for (const [propertyKey, value] of changedProperties) {
						const key = propertyKey as keyof LitElement
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