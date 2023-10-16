import { type ElementPart, noChange, BindingMode } from '@a11d/lit'
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

	override get sourceValue() { return super.sourceValue }
	override set sourceValue(value: unknown) {
		super.sourceValue = value
		if (this.mode !== BindingMode.OneWayToSource && Object.isWritable(this.element, this.property)) {
			(this.element as any)[this.property] = value
		}
	}

	get template() {
		this.sourceValue = this.sourceValue
		return noChange
	}
}