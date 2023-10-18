import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/index.js'
import { Component } from '../Component/index.js'

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => new class extends Controller {
			constructor() {
				super(element)
			}

			private get value() { return (this.host as any)[propertyKey] }

			override hostUpdated() {
				const key = propertyKey as keyof Component
				const props = (element as Component).changedProperties
				if (props?.has(key)) {
					callback.call(this.host, this.value, props.get(key) as T)
				}
			}
		})
	}
}