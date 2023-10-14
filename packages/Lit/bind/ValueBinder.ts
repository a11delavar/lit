import { Part } from 'lit'
import { BindDirectiveParameters } from './BindDirective.js'
import { getAssociatedEvent } from './associatedEvent/getAssociatedEvent.js'

export abstract class ValueBinder<TPart extends Part> {
	protected abstract get element(): Element
	protected abstract get property(): string

	constructor(protected readonly part: TPart, public parameters: BindDirectiveParameters<any, any>) { }

	protected get component() {
		return this.parameters[0]
	}

	protected get objectKey() {
		return this.parameters[1]
	}

	protected get keyPath() {
		return this.parameters[2]?.keyPath
	}

	protected get mode() {
		return this.parameters[2]?.mode ?? this.getDefaultBindingMode()
	}

	protected get event() {
		return this.parameters[2]?.event ?? getAssociatedEvent(this.element, this.property)
	}

	private getDefaultBindingMode() {
		return 'two-way'
		// For accessors
		// const isSourceWritable = Object.getOwnPropertyDescriptor(this.component, this.keyPath)?.set !== undefined
	}

	get value() {
		return this.keyPath
			? getValueByKeyPath(this.component[this.objectKey], this.keyPath as string)
			: this.component[this.objectKey]
	}
	set value(value: any) {
		this.keyPath
			? setValueByKeyPath(this.component[this.objectKey], this.keyPath as string, value)
			: this.component[this.objectKey] = value
	}

	abstract get template(): unknown

	connected() {
		if (this.mode !== 'one-way') {
			this.element.addEventListener(this.event, this.eventListener)
		}
	}

	disconnected() {
		this.element.removeEventListener(this.event, this.eventListener)
	}

	private readonly eventListener = (e: Event) => {
		this.value = e instanceof CustomEvent
			? e.detail
			: (e.target as any)[this.property]

		this.component.requestUpdate(this.objectKey)
	}
}