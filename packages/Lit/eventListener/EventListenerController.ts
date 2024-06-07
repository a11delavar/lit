import { ReactiveElement } from 'lit'
import { Controller } from '../Controller/Controller.js'
import { type EventListenerTarget } from './extractEventTargets.js'
import { extractEventTargets } from './extractEventTargets.js'

type Listener = EventListenerObject | ((e: any) => void)

type FullEventListenerControllerOptions = {
	type: string
	listener: Listener
	target?: EventListenerTarget
	options?: AddEventListenerOptions | boolean
}

type ShorthandEventListenerControllerOptions = [type: string, listener: Listener, options?: AddEventListenerOptions | boolean]

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
	private targets?: Array<EventTarget>

	constructor(
		protected override readonly host: ReactiveElement,
		...options: EventListenerControllerOptions
	) {
		super(host)
		this.options = extractOptions(options)
	}

	protected get context(): object {
		return this.host
	}

	async subscribe() {
		this.targets = await extractEventTargets.call(this.context, this.host, this.options.target)
		for (const target of this.targets) {
			target.addEventListener(this.options.type, this.options.listener, this.options.options)
		}
	}

	async unsubscribe() {
		this.targets ??= await extractEventTargets.call(this.context, this.host, this.options.target)
		for (const target of this.targets) {
			target?.removeEventListener(this.options.type, this.options.listener, this.options.options)
		}
	}

	async resubscribe() {
		await this.unsubscribe()
		await this.subscribe()
	}

	override hostConnected() {
		this.subscribe()
	}

	override hostDisconnected() {
		this.unsubscribe()
	}
}