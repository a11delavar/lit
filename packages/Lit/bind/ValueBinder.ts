import { Part } from 'lit'
import { BindDirectiveParameters, BindingMode } from './BindDirective.js'
import { getAssociatedEvent } from './associatedEvent/getAssociatedEvent.js'

export abstract class ValueBinder<TPart extends Part> {
	protected abstract get element(): Element
	protected abstract get property(): string

	constructor(protected readonly part: TPart, public parameters: BindDirectiveParameters<any, any>) { }

	protected get component() {
		return this.parameters[0]
	}

	protected get sourceKey() {
		return this.parameters[1]
	}

	protected get keyPath() {
		return this.parameters[2]?.keyPath
	}

	protected get mode() {
		const mode = this.parameters[2]?.mode

		if (mode) {
			return mode
		}

		const sourceWritable = this.keyPath
			? isKeyPathWritable(this.component[this.sourceKey], this.keyPath)
			: Object.isWritable(this.component, this.sourceKey)

		const targetWritable = Object.isWritable(this.component, this.property)

		return sourceWritable && targetWritable
			? BindingMode.TwoWay
			: sourceWritable
				? BindingMode.OneWayToSource
				: BindingMode.OneWay
	}

	protected get event() {
		return this.parameters[2]?.event ?? getAssociatedEvent(this.element, this.property)
	}

	get sourceValue() {
		return this.keyPath
			? getValueByKeyPath(this.component[this.sourceKey], this.keyPath as string)
			: this.component[this.sourceKey]
	}
	set sourceValue(value: any) {
		if (this.mode !== BindingMode.OneWay) {
			this.keyPath
				? setValueByKeyPath(this.component[this.sourceKey], this.keyPath as string, value)
				: this.component[this.sourceKey] = value
		}
	}

	abstract get template(): unknown

	connected() {
		if (this.mode !== BindingMode.OneWay) {
			this.element.addEventListener(this.event, this.eventListener)
		}
	}

	disconnected() {
		this.element.removeEventListener(this.event, this.eventListener)
	}

	private readonly eventListener = (e: Event) => {
		this.sourceValue = e instanceof CustomEvent
			? e.detail
			: (e.target as any)[this.property]

		this.component.requestUpdate(this.sourceKey)
	}
}