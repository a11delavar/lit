import { AttributePart, BindingMode, BooleanAttributePart, PropertyPart, noChange } from '@a11d/lit'
import { ValueBinder } from './ValueBinder.js'

export class PropertyValueBinder extends ValueBinder<PropertyPart | AttributePart | BooleanAttributePart> {
	protected get element() {
		return this.part.element
	}

	protected get property() {
		return this.part.name
	}

	get template() {
		return this.mode === BindingMode.OneWayToSource ? noChange : this.sourceValue
	}
}