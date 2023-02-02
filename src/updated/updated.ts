import type { ReactiveElement } from 'lit'
import { Controller } from '../Controller/index.js'

export type UpdatedCallback<T> = (value: T, oldValue: T) => void

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => element.addController(new class extends Controller {
			constructor() { super(element) }

			private hasChanged = false
			private oldValue: any
			private get value() { return (this.host as any)[propertyKey] }

			override hostUpdate() {
				if (this.value !== this.oldValue) {
					this.hasChanged = true
				}
			}

			override hostUpdated() {
				if (this.hasChanged) {
					this.hasChanged = false
					callback.call(this.host, this.value, this.oldValue)
					this.oldValue = this.value
				}
			}
		}))
	}
}