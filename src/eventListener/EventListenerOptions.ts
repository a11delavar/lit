
export type ShorthandEventListenerOptions = [type: string, options?: EventListenerOptions | boolean]
export type FullEventListenerOptions = {
	type: string
	target?: EventTarget | ((this: any) => EventTarget | Promise<EventTarget>)
	options?: EventListenerOptions | boolean
}
export type EventListenerArguments = ShorthandEventListenerOptions | [FullEventListenerOptions]

export function extractOptions(args: EventListenerArguments): FullEventListenerOptions {
	const short = ((args: EventListenerArguments): args is ShorthandEventListenerOptions => typeof args[0] === 'string')(args)
	return {
		type: short ? args[0] : args[0].type,
		target: short ? undefined : args[0].target,
		options: short ? args[1] : args[0].options,
	}
}