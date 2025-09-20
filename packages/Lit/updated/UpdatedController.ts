import { ReactiveElement, type PropertyValues } from 'lit'
import { Controller } from '../Controller/index.js'
import { type Component } from '../Component/index.js'

const changedPropertiesKey = Symbol('changedProperties')

type ReactiveControllerWithChangedProperties<T extends ReactiveElement = ReactiveElement> = T & {
	[changedPropertiesKey]?: PropertyValues
}

const originalUpdate = ReactiveElement.prototype['update']
ReactiveElement.prototype['update'] = function (this: ReactiveElement, changedProperties: PropertyValues) {
	(this as ReactiveControllerWithChangedProperties)[changedPropertiesKey] = changedProperties
	return originalUpdate.call(this, changedProperties)
}

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

export class UpdatedController<T extends ReactiveElement, P extends keyof T> extends Controller {
	constructor(override readonly host: T, readonly propertyKey: P, readonly callback: UpdatedCallback<T[P]>) {
		super(host)
	}

	private get value() { return this.host[this.propertyKey] }

	override hostUpdated() {
		const key = this.propertyKey as keyof Component
		const props = (this.host as ReactiveControllerWithChangedProperties<T>)[changedPropertiesKey]
		if (props?.has(key)) {
			this.callback.call(this.host, this.value, props.get(key) as any)
		}
	}
}