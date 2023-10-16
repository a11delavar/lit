import { ReactiveElement } from '@a11d/lit'

export const bindingDefaultPropertyKey = Symbol('bindingDefaultProperty')

export function bindingDefaultProperty() {
	return (target: ReactiveElement, propertyKey: PropertyKey) => {
		(target.constructor as any)[bindingDefaultPropertyKey] = propertyKey
	}
}