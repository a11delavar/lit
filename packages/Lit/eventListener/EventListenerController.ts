import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/Controller.js'
import type { EventListenerTarget, EventTargets } from './EventListenerTarget.js'

export async function extractEventTargets(this: any, target: EventListenerTarget | undefined) {
	const handle = (value: EventTargets) => Symbol.iterator in value ? [...value] : [value]

	if (target === undefined) {
		return handle(this)
	}

	if (typeof target === 'function') {
		let eventTarget = (target as (this: any) => EventTargets | Promise<EventTargets>).call(this)

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

type Listener = EventListenerObject | ((e: any) => void)

type FullEventListenerControllerOptions = {
	type: string
	listener: Listener
	target?: EventListenerTarget
	options?: EventListenerOptions | boolean
}

type ShorthandEventListenerControllerOptions = [type: string, listener: Listener, options?: EventListenerOptions | boolean]

type EventListenerControllerOptions = ShorthandEventListenerControllerOptions | [FullEventListenerControllerOptions]

function extractOptions(options: EventListenerControllerOptions): FullEventListenerControllerOptions {
	const short = ((args: EventListenerControllerOptions): args is ShorthandEventListenerControllerOptions => typeof args[0] === 'string')(options)
	return {
		target: short ? undefined : options[0].target,
		type: short ? options[0] : options[0].type,
		listener: short ? options[1] : options[0].listener,
		options: short ? options[2] : options[0].options,
	}
}

export class EventListenerController extends Controller {
	protected readonly options: FullEventListenerControllerOptions

	constructor(
		protected override readonly host: ReactiveElement,
		...options: EventListenerControllerOptions
	) {
		super(host)
		this.options = extractOptions(options)
	}

	async subscribe() {
		const targets = await extractEventTargets.call(this.host, this.options.target)
		for (const target of targets) {
			target.addEventListener(this.options.type, this.options.listener, this.options.options)
		}
	}

	async unsubscribe() {
		const targets = await extractEventTargets.call(this.host, this.options.target)
		for (const target of targets) {
			target?.removeEventListener(this.options.type, this.options.listener, this.options.options)
		}
	}

	async resubscribe() {
		await this.unsubscribe()
		await this.subscribe()
	}

	override async hostConnected() {
		await this.subscribe()
	}

	override async hostDisconnected() {
		await this.unsubscribe()
	}
}