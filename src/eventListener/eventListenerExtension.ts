import { ReactiveElement } from 'lit'
import { EventListenerMetadata, eventListenersSymbol, FullEventListenerDecoratorOptions } from './eventListener.js'

const originalConnectedCallback = ReactiveElement.prototype.connectedCallback
ReactiveElement.prototype.connectedCallback = function (this: ReactiveElement) {
	originalConnectedCallback.call(this)
	const eventListeners = getEventHandlers(this)
	for (const { type, target, options, descriptor, propertyKey } of eventListeners?.values() ?? []) {
		defineBoundListener.call(this, propertyKey, descriptor)
		extractEventTarget.call(this, target)
			?.addEventListener(type, getBoundListener.call(this, propertyKey), options)
	}
}

const originalDisconnectedCallback = ReactiveElement.prototype.disconnectedCallback
ReactiveElement.prototype.disconnectedCallback = function (this: ReactiveElement) {
	originalDisconnectedCallback.call(this)
	const eventListeners = getEventHandlers(this)
	for (const { type, target, options, propertyKey } of eventListeners?.values() ?? []) {
		extractEventTarget.call(this, target)
			?.removeEventListener(type, getBoundListener.call(this, propertyKey), options)
	}
}

function getEventHandlers(element: ReactiveElement) {
	return (element.constructor as any)[eventListenersSymbol] as Map<string, EventListenerMetadata> | undefined
}

function extractEventTarget(this: any, target: FullEventListenerDecoratorOptions[0]['target']): EventTarget | undefined {
	return typeof target === 'function' ? target.call(this) : target ?? this
}

function getBoundListener(this: ReactiveElement, propertyKey: string) {
	return Object.getOwnPropertyDescriptor(this, getBoundMethodKey(propertyKey))?.value
}

function defineBoundListener(this: ReactiveElement, propertyKey: string, descriptor?: PropertyDescriptor) {
	const unboundFunction = !descriptor
		? Object.getOwnPropertyDescriptor(this, propertyKey)?.value
		: typeof descriptor.get === 'function'
			? descriptor.get
			: descriptor.value

	if (isEventListenerOrEventListenerObject(unboundFunction) === false) {
		throw new TypeError(`${this.constructor}.${propertyKey} is not a function`)
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
	const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
	return isListener || isListenerObject
}