import { ReactiveElement, type PropertyValues } from 'lit'
import { Controller } from '../Controller/index.js'
import { Component } from '../Component/index.js'

const changedPropertiesKey = Symbol('changedProperties')

type ReactiveControllerWithChangedProperties<T extends ReactiveElement = ReactiveElement> = T & {
	[changedPropertiesKey]?: PropertyValues
}

const originalUpdate = ReactiveElement.prototype['willUpdate']
ReactiveElement.prototype['willUpdate'] = function (this: ReactiveElement, changedProperties: PropertyValues) {
	(this as ReactiveControllerWithChangedProperties)[changedPropertiesKey] = changedProperties
	return originalUpdate.call(this, changedProperties)
}

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

type UpdateLifecycleMethod = 'hostUpdated' | 'hostUpdate'

class LifecycleUpdateController<T extends ReactiveElement, P extends keyof T> extends Controller {
	static create<T extends ReactiveElement, P extends keyof T>(host: T, lifecycleMethod: UpdateLifecycleMethod, propertyKey: P, callback: UpdatedCallback<T[P]>) {
		return new class extends LifecycleUpdateController<T, P> {
			constructor() {
				super(host, propertyKey, callback)
			}

			[lifecycleMethod]() {
				const key = this.propertyKey as keyof Component
				const props = (this.host as ReactiveControllerWithChangedProperties<T>)[changedPropertiesKey]
				if (props?.has(key)) {
					this.callback.call(this.host, this.value, props.get(key) as any)
				}
			}
		}
	}

	private constructor(override readonly host: T, readonly propertyKey: P, readonly callback: UpdatedCallback<T[P]>) {
		super(host)
	}

	get value() {
		return this.host[this.propertyKey]
	}
}

export const lifecycleUpdateDecorator = (lifecycleMethod: UpdateLifecycleMethod) => <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => LifecycleUpdateController.create(
			element,
			lifecycleMethod,
			propertyKey as keyof ReactiveElement,
			callback as UpdatedCallback<any>
		))
	}
}