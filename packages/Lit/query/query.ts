import type { ReactiveElement } from 'lit'
import type { Controller } from '../Controller/Controller.js'
import { host } from '../host.js'

export const query = (selector: string) => {
	return (prototype: ReactiveElement | Controller, propertyKey: PropertyKey) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: ReactiveElement | Controller) {
				return this[host]?.renderRoot?.querySelector(selector) ?? undefined
			}
		})
	}
}