import type { ReactiveElement } from 'lit'

export const queryAll = (selector: string) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: ReactiveElement) {
				return [...this.renderRoot?.querySelectorAll(selector) ?? []]
			}
		})
	}
}