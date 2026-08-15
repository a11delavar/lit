import { ReactiveElement, type PropertyValues } from 'lit'
import { Controller } from '../Controller/index.js'
import { host, type HostProvider } from '../host.js'
import { getChangedPropertyKey } from './getChangedPropertyKey.js'

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

export class UpdatedController<T extends HostProvider, P extends keyof T> extends Controller {
	private readonly changedPropertyKey: PropertyKey

	constructor(readonly context: T, readonly propertyKey: P, readonly callback: UpdatedCallback<T[P]>) {
		super(context[host])
		this.changedPropertyKey = getChangedPropertyKey(context, propertyKey as PropertyKey)
	}

	private get value() { return this.context[this.propertyKey] }

	override hostUpdated() {
		const props = (this.host as unknown as ReactiveControllerWithChangedProperties)[changedPropertiesKey]
		if (props?.has(this.changedPropertyKey)) {
			this.callback.call(this.context, this.value, props.get(this.changedPropertyKey) as any)
		}
	}
}