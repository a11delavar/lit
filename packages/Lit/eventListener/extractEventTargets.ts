export type EventTargets = EventTarget | Iterable<EventTarget>
export type EventTargetsResolver = (this: any) => EventTargets
export type EventTargetsAsyncResolver = (this: any) => Promise<EventTargets>
export type EventListenerTarget = EventTargets | EventTargetsResolver | EventTargetsAsyncResolver

export async function extractEventTargets(this: any, host: any, target: EventListenerTarget | undefined) {
	const handle = (value: EventTargets) => Symbol.iterator in value ? [...value] : [value]

	if (target === undefined) {
		return handle(host)
	}

	if (typeof target === 'function') {
		let eventTarget = (target as (context: any) => EventTargets | Promise<EventTargets>).call(this ?? host, host)

		if (eventTarget instanceof Promise) {
			eventTarget = await eventTarget
		}

		if (eventTarget instanceof EventTarget) {
			return handle(eventTarget)
		}

		if (Symbol.iterator in eventTarget && [...eventTarget].every(t => t instanceof EventTarget)) {
			return handle(eventTarget)
		}

		throw new TypeError('Target is not a valid EventTarget.')
	}

	return handle(target ?? host as EventTarget)
}