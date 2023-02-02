import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/Controller.js'
import { EventListenerArguments, extractOptions, FullEventListenerOptions } from './EventListenerOptions.js'

export async function extractEventTarget(this: any, target: FullEventListenerOptions['target']) {
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

export class EventListenerController extends Controller {
	private static readonly getBoundMethodKey = (method: string) => `$BOUND_${method}$`

	protected readonly options: FullEventListenerOptions

	constructor(
		protected override readonly host: ReactiveElement,
		protected readonly propertyKey: string,
		...options: EventListenerArguments
	) {
		super(host)
		this.options = extractOptions(options)
	}

	override async hostDisconnected() {
		const t = await extractEventTarget.call(this.host, this.options.target)
		t?.removeEventListener(this.options.type, this.getBoundListener(this.propertyKey), this.options.options)
	}

	override async hostConnected() {
		this.defineBoundListener()
		const t = await extractEventTarget.call(this.host, this.options.target)
		t?.addEventListener(this.options.type, this.getBoundListener(this.propertyKey), this.options.options)
	}

	private getBoundListener(propertyKey: string) {
		return Object.getOwnPropertyDescriptor(this.host, EventListenerController.getBoundMethodKey(propertyKey))?.value
	}

	private defineBoundListener() {
		const isEventListenerOrEventListenerObject = (listener: unknown): listener is EventListenerOrEventListenerObject => {
			const isListener = typeof listener === 'function'
			const isListenerObject = typeof listener === 'object' && listener !== null && 'handleEvent' in listener && typeof listener.handleEvent === 'function'
			return isListener || isListenerObject
		}

		const descriptor = Object.getOwnPropertyDescriptor(this.host.constructor.prototype, this.propertyKey)
		const unboundFunction = !descriptor
			? Object.getOwnPropertyDescriptor(this.host, this.propertyKey)?.value
			: typeof descriptor.get === 'function'
				? descriptor.get
				: descriptor.value

		if (isEventListenerOrEventListenerObject(unboundFunction) === false) {
			throw new TypeError(`${this.host.constructor}.${this.propertyKey} is not a function`)
		}

		Object.defineProperty(this.host, EventListenerController.getBoundMethodKey(this.propertyKey), {
			// eslint-disable-next-line no-restricted-syntax
			value: unboundFunction.bind(this.host),
			configurable: true,
			enumerable: false,
			writable: false,
		})
	}
}