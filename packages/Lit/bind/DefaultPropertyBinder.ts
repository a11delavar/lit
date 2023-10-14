import { type ElementPart, nothing } from '@a11d/lit'
import { ValueBinder } from './ValueBinder.js'
import { bindingDefaultPropertyKey } from './bindingDefaultProperty.js'

export class DefaultPropertyBinder extends ValueBinder<ElementPart> {
	protected get element() {
		return this.part.element
	}

	protected get property() {
		const property = (this.element.constructor as any)[bindingDefaultPropertyKey]

		if (!property) {
			throw new Error(`The default binding property is not defined for ${this.element.tagName.toLowerCase()}`)
		}

		return property
	}

	override get value() { return super.value }
	override set value(value: unknown) {
		super.value = value;
		(this.element as any)[this.property] = value
	}

	get template() {
		this.value = this.value
		return nothing
	}
}