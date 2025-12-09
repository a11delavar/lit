import { type ElementPart, noChange, BindingMode } from '@a11d/lit'
import { ValueBinder } from './ValueBinder.js'
import { bindingDefaultPropertyKey } from './bindingDefaultProperty.js'

export class DefaultPropertyBinder extends ValueBinder<ElementPart> {
	get element() {
		return this.part.element
	}

	get targetProperty() {
		const property = (this.element.constructor as any)[bindingDefaultPropertyKey]

		if (!property) {
			throw new Error(`The default binding property is not defined for ${this.element.tagName.toLowerCase()}`)
		}

		return property
	}

	override get value() { return super.value }
	override set value(value: unknown) {
		super.value = value
		if (this.mode !== BindingMode.OneWayToSource && Object.isWritable(this.element, this.targetProperty)) {
			(this.element as any)[this.targetProperty] = value
		}
	}

	get template() {
		this.value = this.value
		return noChange
	}
}