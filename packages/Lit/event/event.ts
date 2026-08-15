import { isServer } from 'lit'
import { HTMLElementEventDispatcher } from './HTMLElementEventDispatcher.js'
import { PureEventDispatcher } from './PureEventDispatcher.js'
import { host } from '../host.js'

export function event(options?: EventInit & { readonly type?: string }) {
	return (prototype: unknown, propertyKey?: string) => {
		if (propertyKey === undefined) {
			return
		}

		Object.defineProperty(prototype, propertyKey, {
			get(this: any) {
				const element = this[host]
				return this[`$${propertyKey}Event$`] ??= !isServer && element instanceof HTMLElement
					? new HTMLElementEventDispatcher(element, options?.type ?? propertyKey, options)
					: new PureEventDispatcher()
			}
		})
	}
}