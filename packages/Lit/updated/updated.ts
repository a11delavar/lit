import { type ReactiveElement } from 'lit'
import { type Controller } from '../Controller/Controller.js'
import { type UpdatedCallback, UpdatedController } from './UpdatedController.js'

export const updated = <T>(callback: UpdatedCallback<T>) => {
	return (prototype: ReactiveElement | Controller, propertyKey: PropertyKey) => {
		const Constructor = prototype.constructor as typeof ReactiveElement | typeof Controller
		Constructor.addInitializer(context => new UpdatedController(context, propertyKey as never, callback as UpdatedCallback<any>))
	}
}