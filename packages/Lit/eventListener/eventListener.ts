import { ReactiveElement } from 'lit'
import { EventListenerController } from './EventListenerController.js'
import type { EventListenerTarget } from './extractEventTargets.js'
import type { Controller } from '../Controller/Controller.js'

type ShorthandEventListenerDecoratorOptions = [type: string, options?: AddEventListenerOptions | boolean]

type FullEventListenerDecoratorOptions = {
	type: string
	target?: EventListenerTarget
	options?: AddEventListenerOptions | boolean
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
	return (prototype: ReactiveElement | Controller, propertyKey: string, descriptor?: PropertyDescriptor) => {
		const Constructor = prototype.constructor as typeof ReactiveElement | typeof Controller
		Constructor.addInitializer(context => {
			const element = context instanceof ReactiveElement ? context : context['host'] as ReactiveElement
			new class extends EventListenerController {
				constructor() {
					const { type, target, options } = extractOptions(eventListenerOptions)
					super(element, { type, target, options, listener: undefined! })
					this.options.listener = this
				}

				protected override get context() {
					return context
				}

				handleEvent(event: Event) {
					(!descriptor
						? Object.getOwnPropertyDescriptor(context, propertyKey)!.value
						: typeof descriptor.get === 'function'
							? descriptor.get
							: descriptor.value
					).call(context, event)
				}
			}
		})
	}
}