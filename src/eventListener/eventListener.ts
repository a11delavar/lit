import { EventListenerController } from './EventListenerController.js'
import type { ReactiveElement } from 'lit'
import type { EventListenerTarget } from './EventListenerTarget.js'

type ShorthandEventListenerDecoratorOptions = [type: string, options?: EventListenerOptions | boolean]

type FullEventListenerDecoratorOptions = {
	type: string
	target?: EventListenerTarget
	options?: EventListenerOptions | boolean
}

type EventListenerDecoratorOptions = ShorthandEventListenerDecoratorOptions | [FullEventListenerDecoratorOptions]

export function extractOptions(args: EventListenerDecoratorOptions): FullEventListenerDecoratorOptions {
	const short = ((args: EventListenerDecoratorOptions): args is ShorthandEventListenerDecoratorOptions => typeof args[0] === 'string')(args)
	return {
		type: short ? args[0] : args[0].type,
		target: short ? undefined : args[0].target,
		options: short ? args[1] : args[0].options,
	}
}

export const eventListener = (...eventListenerOptions: EventListenerDecoratorOptions) => {
	return (prototype: ReactiveElement, propertyKey: string, descriptor?: PropertyDescriptor) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => {
			element.addController(new class extends EventListenerController {
				constructor() {
					const { type, target, options } = extractOptions(eventListenerOptions)
					super(element, { type, target, options, listener: undefined! })
				}

				override hostConnected() {
					const unboundListener = !descriptor
						? Object.getOwnPropertyDescriptor(element, propertyKey)?.value
						: typeof descriptor.get === 'function'
							? descriptor.get
							: descriptor.value
					this.options.listener = unboundListener.bind(element)
					return super.hostConnected()
				}
			})
		})
	}
}