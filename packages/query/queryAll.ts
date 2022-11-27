import { LitElement } from 'lit'

export const queryAll = (selector: string) => {
	return (prototype: LitElement, propertyKey: PropertyKey) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: LitElement) {
				return [...this.renderRoot?.querySelectorAll(selector) ?? []]
			}
		})
	}
}