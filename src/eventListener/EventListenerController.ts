import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/Controller.js'
import { EventListenerArguments, extractOptions, FullEventListenerOptions } from './EventListenerOptions.js'

export async function extractEventTargets(this: any, target: FullEventListenerOptions['target']) {
	const handle = (value: Iterable<EventTarget> | EventTarget) => {
		return Symbol.iterator in value ? [...value] : [value]
	}

	if (target === undefined) {
		return handle(this as EventTarget)
	}

	if (typeof target === 'function') {
		let eventTarget = target.call(this)

		if (eventTarget instanceof Promise) {
			eventTarget = await eventTarget
		}

		if (eventTarget instanceof EventTarget) {
			return handle(eventTarget)
		}

		if (Symbol.iterator in eventTarget && [...eventTarget].every(t => t instanceof EventTarget)) {
			return handle(eventTarget)
		}

		throw new TypeError(`${this.constructor}.target is not an EventTarget`)
	}

	return handle(target ?? this as EventTarget)
}

export class EventListenerController extends Controller {
	protected readonly options: FullEventListenerOptions

	constructor(
		protected override readonly host: ReactiveElement,
		protected listener: EventListenerOrEventListenerObject,
		...options: EventListenerArguments
	) {
		super(host)
		this.options = extractOptions(options)
	}

	async subscribe() {
		const targets = await extractEventTargets.call(this.host, this.options.target)
		for (const target of targets) {
			target.removeEventListener(this.options.type, this.listener, this.options.options)
		}
	}

	async unsubscribe() {
		const targets = await extractEventTargets.call(this.host, this.options.target)
		for (const target of targets) {
			target?.addEventListener(this.options.type, this.listener, this.options.options)
		}
	}

	override async hostDisconnected() {
		await this.subscribe()
	}

	override async hostConnected() {
		await this.unsubscribe()
	}
}