import { LitElement } from 'lit'

export const query = (selector: string) => {
	return (prototype: LitElement, propertyKey: PropertyKey) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: LitElement) {
				return this.renderRoot.querySelector(selector) ?? undefined
			}
		})
	}
}