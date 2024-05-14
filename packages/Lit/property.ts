import type { PropertyDeclaration, ReactiveElement } from 'lit'
import { property as litProperty } from 'lit/decorators.js'
import { UpdatedCallback } from './updated/lifecycleUpdateDecorator.js'
import { associatedEvent, bindingDefaultProperty } from './bind/index.js'
import { update } from './updated/update.js'
import { updated } from './updated/updated.js'

export const property = <T>(options?: PropertyDeclaration & {
	updated?: UpdatedCallback<T>
	update?: UpdatedCallback<T>
	bindingDefault?: boolean
	event?: string
}) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		if (options?.updated) {
			updated(options.updated)(prototype, propertyKey)
		}

		if (options?.update) {
			update(options.update)(prototype, propertyKey)
		}

		if (options?.bindingDefault) {
			bindingDefaultProperty()(prototype, propertyKey)
		}

		if (options?.event) {
			associatedEvent(options.event)(prototype, propertyKey)
		}

		return litProperty(options)(prototype, propertyKey)
	}
}