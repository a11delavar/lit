import { EventListenerController } from './EventListenerController.js'
import { EventListenerArguments } from './EventListenerOptions.js'
import type { ReactiveElement } from 'lit'

export const eventListener = (...eventListenerOptions: EventListenerArguments) => {
	return (prototype: ReactiveElement, propertyKey: string, descriptor?: PropertyDescriptor) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => {
			element.addController(new EventListenerController(element, propertyKey, descriptor, ...eventListenerOptions))
		})
	}
}