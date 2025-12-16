import { isServer } from 'lit'
import { HTMLElementEventDispatcher } from './HTMLElementEventDispatcher.js'
import { PureEventDispatcher } from './PureEventDispatcher.js'

export function event(options?: EventInit & { readonly type?: string }) {
	return (prototype: unknown, propertyKey?: string) => {
		if (propertyKey === undefined) {
			return
		}

		Object.defineProperty(prototype, propertyKey, {
			get(this: any) {
				return this[`$${propertyKey}Event$`] ??= !isServer && this instanceof HTMLElement
					? new HTMLElementEventDispatcher(this, options?.type ?? propertyKey, options)
					: new PureEventDispatcher()
			}
		})
	}
}