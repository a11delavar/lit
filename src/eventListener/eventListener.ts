import type { ReactiveElement } from 'lit'
import { decorateReactiveElement } from '../decorateReactiveElement.js'

export type ShorthandEventListenerDecoratorOptions = [type: string, options?: EventListenerOptions | boolean]
export type FullEventListenerDecoratorOptions = [{
	type: string
	target?: EventTarget | ((this: any) => EventTarget)
	options?: EventListenerOptions | boolean
}]
export type EventListenerDecoratorOptions = ShorthandEventListenerDecoratorOptions | FullEventListenerDecoratorOptions

function extractArguments(args: EventListenerDecoratorOptions) {
	const short = ((args: EventListenerDecoratorOptions): args is ShorthandEventListenerDecoratorOptions => typeof args[0] === 'string')(args)
	return {
		type: short ? args[0] : args[0].type,
		target: short ? undefined : args[0].target,
		options: short ? args[1] : args[0].options,
	}
}

export const eventListenersSymbol = Symbol('eventListeners')

export type EventListenerMetadata = ReturnType<typeof extractArguments> & {
	descriptor?: PropertyDescriptor
	propertyKey: string
}

export const eventListener = (...eventListenerOptions: EventListenerDecoratorOptions) => {
	return (prototype: ReactiveElement, propertyKey: string, descriptor?: PropertyDescriptor) => {
		const extractedArguments = extractArguments(eventListenerOptions)
		decorateReactiveElement<Map<string, EventListenerMetadata>>({
			prototype,
			constructorPropertyKey: eventListenersSymbol,
			initialValue: new Map,
		}).set(`${extractedArguments.type}.${propertyKey}`, { descriptor, propertyKey, ...extractedArguments })
	}
}