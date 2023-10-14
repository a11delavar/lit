import { directive, AsyncDirective, type ElementPart, type PartInfo, PartType, AttributePart, BooleanAttributePart, PropertyPart, ReactiveElement, DirectiveResult } from '../index.js'
import '@3mo/key-path'
import { ValueBinder } from './ValueBinder.js'
import { PropertyValueBinder } from './PropertyValueBinder.js'
import { DefaultPropertyBinder } from './DefaultPropertyBinder.js'

export enum BindingMode {
	/**
	 * Indicates a one-way binding from the data source to the target property.
	 */
	OneWay = 'one-way',
	/**
	 * Indicated a two-way binding between the data source and the target property.
	 * This is the default mode when the source is not read-only.
	 */
	TwoWay = 'two-way',
	/**
	 * Indicates a one-way binding from the target property to the data source.
	 * This is the default mode when the source is read-only.
	 */
	OneWayToSource = 'one-way-to-source',
}

export type BindDirectiveParameters<Component extends ReactiveElement, Property extends keyof Component> = [
	component: Component,
	property: Property,
	options?: {
		keyPath?: KeyPathOf<Component[Property]>
		mode?: BindingMode
		event?: string
	}
]

type BindDirectivePart = ElementPart | AttributePart | BooleanAttributePart | PropertyPart

class BindDirective<Component extends ReactiveElement, Property extends keyof Component> extends AsyncDirective {
	private valueBinder?: ValueBinder<BindDirectivePart>

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type === PartType.CHILD || partInfo.type === PartType.EVENT) {
			throw new Error('The `bind` directive cannot be used in child or event bindings')
		}
	}

	render() {
		return this.valueBinder?.template
	}

	override update(part: BindDirectivePart, parameters: BindDirectiveParameters<Component, Property>) {
		if (!this.valueBinder) {
			this.valueBinder = [PartType.PROPERTY, PartType.BOOLEAN_ATTRIBUTE, PartType.ATTRIBUTE].includes(part.type as any)
				? new PropertyValueBinder(part as any, parameters)
				: new DefaultPropertyBinder(part as any, parameters)
			this.valueBinder.connected()
		}
		this.valueBinder.parameters = parameters

		return super.update(part, parameters)
	}

	protected override disconnected() {
		this.valueBinder?.disconnected()
	}

	protected override reconnected() {
		this.valueBinder?.connected()
	}
}

export const bind = <Component extends ReactiveElement, Property extends keyof Component>(...parameters: BindDirectiveParameters<Component, Property>) => {
	return (directive(BindDirective) as any)(...parameters) as DirectiveResult<typeof BindDirective<Component, Property>>
}