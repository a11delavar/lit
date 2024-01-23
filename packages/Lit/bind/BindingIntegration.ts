import { ValueBinder } from './ValueBinder.js'

export const bindingIntegrations = new Set<BindingIntegration>()

export const bindingIntegration = () => {
	return (BindingIntegrationConstructor: Constructor<BindingIntegration>) => {
		bindingIntegrations.add(new BindingIntegrationConstructor)
	}
}

export abstract class BindingIntegration {
	abstract bind(valueBinder: ValueBinder<any>): void
}