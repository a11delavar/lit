import { ReactiveElement } from 'lit'
import { EventListenerMetadata, eventListenersSymbol, FullEventListenerDecoratorOptions } from './eventListener.js'

export async function extractEventTarget(this: any, target: FullEventListenerDecoratorOptions[0]['target']) {
	if (target === undefined) {
		return this as EventTarget
	}

	if (typeof target === 'function') {
		let eventTarget = target.call(this)

		if (eventTarget instanceof Promise) {
			eventTarget = await eventTarget
		}

		if (eventTarget instanceof EventTarget) {
			return eventTarget
		}

		throw new TypeError(`${this.constructor}.target is not an EventTarget`)
	}

	return target ?? this as EventTarget
}

ReactiveElement.addInitializer(element => {
	const eventListeners = (element.constructor as any)[eventListenersSymbol] as Map<string, EventListenerMetadata> | undefined

	const getBoundMethodKey = (method: string) => `$BOUND_${method}$`

	const getBoundListener = (propertyKey: string) => {
		return Object.getOwnPropertyDescriptor(element, getBoundMethodKey(propertyKey))?.value
	}

	element.addController({
		async hostConnected() {
			const defineBoundListener = (propertyKey: string, descriptor?: PropertyDescriptor) => {
				const isEventListenerOrEventListenerObject = (listener: unknown): listener is EventListenerOrEventListenerObject => {
					const isListener = typeof listener === 'function'
					const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
					return isListener || isListenerObject
				}

				const unboundFunction = !descriptor
					? Object.getOwnPropertyDescriptor(element, propertyKey)?.value
					: typeof descriptor.get === 'function'
						? descriptor.get
						: descriptor.value

				if (isEventListenerOrEventListenerObject(unboundFunction) === false) {
					throw new TypeError(`${element.constructor}.${propertyKey} is not a function`)
				}

				Object.defineProperty(element, getBoundMethodKey(propertyKey), {
					// eslint-disable-next-line no-restricted-syntax
					value: unboundFunction.bind(element),
					configurable: true,
					enumerable: false,
					writable: false,
				})
			}

			for (const { type, target, options, descriptor, propertyKey } of eventListeners?.values() ?? []) {
				defineBoundListener.call(element, propertyKey, descriptor)
				const t = await extractEventTarget.call(element, target)
				t?.addEventListener(type, getBoundListener.call(element, propertyKey), options)
			}
		},
		async hostDisconnected() {
			for (const { type, target, options, propertyKey } of eventListeners?.values() ?? []) {
				const t = await extractEventTarget.call(element, target)
				t?.removeEventListener(type, getBoundListener.call(element, propertyKey), options)
			}
		},
	})
})