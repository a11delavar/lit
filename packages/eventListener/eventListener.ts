import { EventPart, LitElement } from 'lit'
import { decorateLitElement } from '../decorateLitElement'

type ShorthandEventListenerDecoratorOptions = [type: string, options?: EventListenerOptions | boolean]
type FullEventListenerDecoratorOptions = [{
	type: string
	target?: EventTarget | ((this: any) => EventTarget)
	options?: EventListenerOptions | boolean
}]
type EventListenerDecoratorOptions = ShorthandEventListenerDecoratorOptions | FullEventListenerDecoratorOptions

function extractArguments(args: EventListenerDecoratorOptions) {
	const short = ((args: EventListenerDecoratorOptions): args is ShorthandEventListenerDecoratorOptions => typeof args[0] === 'string')(args)
	return {
		type: short ? args[0] : args[0].type,
		target: short ? undefined : args[0].target,
		options: short ? args[1] : args[0].options,
	}
}

function extractEventTarget(this: any, target: FullEventListenerDecoratorOptions[0]['target']): EventTarget | undefined {
	return typeof target === 'function' ? target.call(this) : target ?? this
}

export const eventListener = (...eventListenerOptions: EventListenerDecoratorOptions) => {
	return (prototype: LitElement, propertyKey: string, descriptor?: PropertyDescriptor) => {
		decorateLitElement<Map<any, ReturnType<typeof extractArguments> & { descriptor?: PropertyDescriptor, property: string }>>({
			prototype,
			constructorPropertyName: '$eventListeners$',
			initialValue: new Map,
			lifecycleHooks: new Map([
				['connectedCallback', function (this, eventListeners) {
					for (const [key, { type, target, options, descriptor, property }] of eventListeners) {
						if (this.constructor.name === extractConstructorNameFromUniquePropertyKey(key)) {
							defineBoundListener.call(this, property, descriptor)
							extractEventTarget.call(this, target)
								?.addEventListener(type, getBoundListener.call(this, property), options)
						}
					}
				}],
				['disconnectedCallback', function (this, eventListeners) {
					for (const { type, target, options, property } of eventListeners.values()) {
						extractEventTarget.call(this, target)
							?.removeEventListener(type, getBoundListener.call(this, property), options)
					}
				}],
			])
		}).set(getUniquePropertyKey(prototype.constructor, propertyKey), { descriptor, property: propertyKey, ...extractArguments(eventListenerOptions) })
	}
}

const getUniquePropertyKey = (constructor: any, property: string) => `${constructor.name}.${property}`
const extractConstructorNameFromUniquePropertyKey = (uniquePropertyKey: string) => uniquePropertyKey.split('.')[0]

function getBoundListener(this: LitElement, propertyKey: string) {
	return Object.getOwnPropertyDescriptor(this, getBoundMethodKey(propertyKey))?.value
}

function defineBoundListener(this: LitElement, propertyKey: string, descriptor?: PropertyDescriptor) {
	const unboundFunction = !descriptor
		? Object.getOwnPropertyDescriptor(this, propertyKey)?.value
		: typeof descriptor.get === 'function'
			? descriptor.get
			: descriptor.value

	if (isEventListenerOrEventListenerObject(unboundFunction) === false) {
		throw new TypeError(`${getUniquePropertyKey(this.constructor, propertyKey)} is not a function`)
	}

	Object.defineProperty(this, getBoundMethodKey(propertyKey), {
		// eslint-disable-next-line no-restricted-syntax
		value: unboundFunction.bind(this),
		configurable: true,
		enumerable: false,
		writable: false,
	})
}

const getBoundMethodKey = (method: string) => `$BOUND_${method}$`

const isEventListenerOrEventListenerObject = (listener: unknown): listener is EventListenerOrEventListenerObject => {
	const isListener = typeof listener === 'function'
	// @ts-expect-error 'in' operator seemingly does not narrow down the type
	const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
	return isListener || isListenerObject
}

export const extractEventHandler = <TEvent extends Event = Event>(eventListener: EventListenerOrEventListenerObject) => {
	if ('_$committedValue' in eventListener) {
		const eventPart = eventListener as EventPart
		const handler = eventListener['_$committedValue'] as (event: TEvent) => void
		// eslint-disable-next-line no-restricted-syntax
		return handler.bind(eventPart.element)
	}
	return typeof eventListener === 'function' ? eventListener : eventListener.handleEvent
}