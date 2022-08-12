import { LitElement } from 'lit'
import { EventListenerMetadata, eventListenersSymbol, FullEventListenerDecoratorOptions } from './eventListener'

const originalLitElementConnectedCallback = LitElement.prototype.connectedCallback
LitElement.prototype.connectedCallback = function (this: LitElement) {
	originalLitElementConnectedCallback.call(this)
	const eventListeners = getEventHandlers(this)
	for (const { type, target, options, descriptor, propertyKey } of eventListeners?.values() ?? []) {
		defineBoundListener.call(this, propertyKey, descriptor)
		extractEventTarget.call(this, target)
			?.addEventListener(type, getBoundListener.call(this, propertyKey), options)
	}
}

const originalLitElementDisconnectedCallback = LitElement.prototype.disconnectedCallback
LitElement.prototype.disconnectedCallback = function (this: LitElement) {
	originalLitElementDisconnectedCallback.call(this)
	const eventListeners = getEventHandlers(this)
	for (const { type, target, options, propertyKey } of eventListeners?.values() ?? []) {
		extractEventTarget.call(this, target)
			?.removeEventListener(type, getBoundListener.call(this, propertyKey), options)
	}
}

function getEventHandlers(element: LitElement) {
	return (element.constructor as any)[eventListenersSymbol] as Map<string, EventListenerMetadata> | undefined
}

function extractEventTarget(this: any, target: FullEventListenerDecoratorOptions[0]['target']): EventTarget | undefined {
	return typeof target === 'function' ? target.call(this) : target ?? this
}

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
	// @ts-expect-error 'in' operator seemingly does not narrow down the type
	const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
	return isListener || isListenerObject
}