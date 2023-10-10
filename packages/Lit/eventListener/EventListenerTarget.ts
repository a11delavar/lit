export type EventTargets = EventTarget | Iterable<EventTarget>
export type EventTargetsResolver = (this: any) => EventTargets
export type EventTargetsAsyncResolver = (this: any) => Promise<EventTargets>
export type EventListenerTarget = EventTargets | EventTargetsResolver | EventTargetsAsyncResolver