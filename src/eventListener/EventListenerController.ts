import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/Controller.js'
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

ReactiveElement.addInitializer(element => element.addController(new EventListenerController(element)))

class EventListenerController extends Controller {
	private static readonly getBoundMethodKey = (method: string) => `$BOUND_${method}$`

	private get eventListeners() {
		return (this.host.constructor as any)[eventListenersSymbol] as Map<string, EventListenerMetadata> | undefined
	}

	override async hostDisconnected() {
		for (const { type, target, options, propertyKey } of this.eventListeners?.values() ?? []) {
			const t = await extractEventTarget.call(this.host, target)
			t?.removeEventListener(type, this.getBoundListener(propertyKey), options)
		}
	}

	override async hostConnected() {
		for (const { type, target, options, descriptor, propertyKey } of this.eventListeners?.values() ?? []) {
			this.defineBoundListener(propertyKey, descriptor)
			const t = await extractEventTarget.call(this.host, target)
			t?.addEventListener(type, this.getBoundListener(propertyKey), options)
		}
	}

	private getBoundListener(propertyKey: string) {
		return Object.getOwnPropertyDescriptor(this.host, EventListenerController.getBoundMethodKey(propertyKey))?.value
	}

	private defineBoundListener(propertyKey: string, descriptor?: PropertyDescriptor) {
		const isEventListenerOrEventListenerObject = (listener: unknown): listener is EventListenerOrEventListenerObject => {
			const isListener = typeof listener === 'function'
			const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
			return isListener || isListenerObject
		}

		const unboundFunction = !descriptor
			? Object.getOwnPropertyDescriptor(this.host, propertyKey)?.value
			: typeof descriptor.get === 'function'
				? descriptor.get
				: descriptor.value

		if (isEventListenerOrEventListenerObject(unboundFunction) === false) {
			throw new TypeError(`${this.host.constructor}.${propertyKey} is not a function`)
		}

		Object.defineProperty(this.host, EventListenerController.getBoundMethodKey(propertyKey), {
			// eslint-disable-next-line no-restricted-syntax
			value: unboundFunction.bind(this.host),
			configurable: true,
			enumerable: false,
			writable: false,
		})
	}
}