import { AttributePart, BindingMode, BooleanAttributePart, PropertyPart, noChange } from '@a11d/lit'
import { ValueBinder } from './ValueBinder.js'

export class PropertyValueBinder extends ValueBinder<PropertyPart | AttributePart | BooleanAttributePart> {
	get element() {
		return this.part.element
	}

	get property() {
		return this.part.name
	}

	get template() {
		return this.mode === BindingMode.OneWayToSource ? noChange : this.sourceValue
	}
}