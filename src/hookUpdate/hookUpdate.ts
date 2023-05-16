import type { Component } from '../Component/index.js'

export const hookUpdate = () => {
	return (prototype: Component, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof Component
		Constructor.addInitializer(element => (element as Component).updateHookPropertyKeys.add(propertyKey))
	}
}