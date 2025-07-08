import { type ReactiveElement } from 'lit'
import { type UpdatedCallback, UpdatedController } from './UpdatedController.js'

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof ReactiveElement
		Constructor.addInitializer(element => new UpdatedController(element, propertyKey as keyof ReactiveElement, callback as UpdatedCallback<any>))
	}
}