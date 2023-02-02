import { EventListenerController } from './EventListenerController.js'
import { EventListenerArguments } from './EventListenerOptions.js'
import type { ReactiveElement } from 'lit'

export const eventListener = (...eventListenerOptions: EventListenerArguments) => {
	return (prototype: ReactiveElement, propertyKey: string, descriptor?: PropertyDescriptor) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => {
			element.addController(new class extends EventListenerController {
				constructor() {
					super(element, undefined!, ...eventListenerOptions)
				}

				override hostConnected() {
					const unboundListener = !descriptor
						? Object.getOwnPropertyDescriptor(element, propertyKey)?.value
						: typeof descriptor.get === 'function'
							? descriptor.get
							: descriptor.value
					this.listener = unboundListener.bind(element)
					return super.hostConnected()
				}
			})
		})
	}
}