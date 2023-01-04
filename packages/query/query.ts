import type { ReactiveElement } from 'lit'

export const query = (selector: string) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: ReactiveElement) {
				return this.renderRoot?.querySelector(selector) ?? undefined
			}
		})
	}
}