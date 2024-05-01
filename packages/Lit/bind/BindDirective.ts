import { directive, AsyncDirective, type ElementPart, type PartInfo, PartType, type AttributePart, type BooleanAttributePart, type PropertyPart, type ReactiveElement, type DirectiveResult, noChange } from '../index.js'
import '@a11d/key-path'
import { type ValueBinder } from './ValueBinder.js'
import { PropertyValueBinder } from './PropertyValueBinder.js'
import { DefaultPropertyBinder } from './DefaultPropertyBinder.js'

export enum BindingMode {
	/**
	 * Indicates a one-way binding from the data source to the target property.
	 * This is the default mode when the source is read-only.
	 */
	OneWay = 'one-way',
	/**
	 * Indicates a two-way binding between the data source and the target property.
	 * This is the default mode when neither the source nor target is read-only.
	 */
	TwoWay = 'two-way',
	/**
	 * Indicates a one-way binding from the target property to the data source.
	 * This is the default mode when the target is read-only.
	 */
	OneWayToSource = 'one-way-to-source',
}

/**
 * The source a binding can be established on.
 *
 * Besides `ReactiveElement`s this includes any context which forwards its updates to a host,
 * such as a `ComponentPart`, so bindings can be declared in a part's template as well.
 */
export type BindSource = Pick<ReactiveElement, 'requestUpdate'>

export type BindDirectiveParameters<Component extends BindSource, Property extends keyof Component> = [
	component: Component,
	property: Property,
	options?: BindDirectiveParametersOptions<Component[Property]>,
]

export type BindDirectiveParametersOptions<Data> = {
	keyPath?: KeyPath.Of<Data>
	mode?: BindingMode
	event?: string
	sourceUpdate?: (value: Data) => void
	sourceUpdated?: (value: Data) => void
	dispatchSourceAssociatedEvent?: boolean
}

type BindDirectivePart = ElementPart | AttributePart | BooleanAttributePart | PropertyPart

class BindDirective<Component extends BindSource, Property extends keyof Component> extends AsyncDirective {
	#valueBinder?: ValueBinder<BindDirectivePart>

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type === PartType.CHILD || partInfo.type === PartType.EVENT) {
			throw new Error('The `bind` directive cannot be used in child or event bindings')
		}
	}

	// The server only calls `render`, so without a binder the source value is rendered into attributes and properties:
	render(...[component, property, options]: BindDirectiveParameters<Component, Property>) {
		return this.#valueBinder ? this.#valueBinder.template
			: options?.mode === BindingMode.OneWayToSource ? noChange
				: options?.keyPath ? KeyPath.get(component[property] as any, options.keyPath as string)
					: component[property]
	}

	override update(part: BindDirectivePart, parameters: BindDirectiveParameters<Component, Property>) {
		if (!this.#valueBinder) {
			this.#valueBinder = [PartType.PROPERTY, PartType.BOOLEAN_ATTRIBUTE, PartType.ATTRIBUTE].includes(part.type as any)
				? new PropertyValueBinder(part as any, parameters)
				: new DefaultPropertyBinder(part as any, parameters)
			this.#valueBinder.connected()
		}
		this.#valueBinder.parameters = parameters

		return super.update(part, parameters)
	}

	override disconnected() {
		this.#valueBinder?.disconnected()
	}

	override reconnected() {
		this.#valueBinder?.connected()
	}
}

export const bind = <Component extends BindSource, Property extends keyof Component>(...parameters: BindDirectiveParameters<Component, Property>) => {
	return (directive(BindDirective) as any)(...parameters) as DirectiveResult<typeof BindDirective<Component, Property>>
}
