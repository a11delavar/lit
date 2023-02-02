type Targets = EventTarget | Iterable<EventTarget>
export type EventListenerTarget = Targets | ((this: any) => Targets | Promise<Targets>)