import { HTMLElementEventDispatcher } from './HTMLElementEventDispatcher'
import { PureEventDispatcher } from './PureEventDispatcher'

export function event(options?: EventInit) {
	return (prototype: unknown, propertyKey?: string) => {
		if (propertyKey === undefined) {
			return
		}

		const eventFieldName = `$${propertyKey}Event$`
		Object.defineProperty(prototype, propertyKey, {
			get(this: any) {
				if (!this[eventFieldName]) {
					this[eventFieldName] = this instanceof HTMLElement
						? new HTMLElementEventDispatcher(this, propertyKey, options)
						: new PureEventDispatcher()
				}
				return this[eventFieldName]
			}
		})
	}
}