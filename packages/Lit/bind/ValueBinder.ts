import { type Part } from 'lit'
import { type BindDirectiveParameters, BindingMode } from './BindDirective.js'
import { getAssociatedEvent } from './associatedEvent/getAssociatedEvent.js'
import { bindingIntegrations } from './BindingIntegration.js'
import { Property } from './Property.js'

export abstract class ValueBinder<TPart extends Part = any> {
	abstract get element(): Element
	abstract get targetProperty(): string

	constructor(protected readonly part: TPart, public parameters: BindDirectiveParameters<any, any>) { }

	get component() {
		return this.parameters[0]
	}

	private _property?: Property<any>
	get property(): Property<any> {
		if (!this._property) {
			const param = this.parameters[1]
			if (param instanceof Property) {
				this._property = param
			} else {
				const keyPath = this.parameters[2]?.keyPath
				this._property = keyPath
					? Property.fromKeyPath(this.component[param as keyof typeof this.component], keyPath as any)
					: Property.fromPropertyKey(this.component, param as string)
			}
		}
		return this._property
	}

	private get sourceKey() {
		const param = this.parameters[1]
		return param instanceof Property ? undefined : param
	}

	get context() {
		const key = this.sourceKey
		return key ? this.component[key as keyof typeof this.component] : undefined
	}

	get sourceUpdate() {
		return this.parameters[2]?.sourceUpdate
	}

	get sourceUpdated() {
		return this.parameters[2]?.sourceUpdated
	}

	get mode() {
		const mode = this.parameters[2]?.mode

		if (mode) {
			return mode
		}

		// Check source writability without creating the Property instance yet
		// to allow proper mode detection based on runtime checks
		const param = this.parameters[1]
		const sourceWritable = param instanceof Property
			? param.isWritable
			: this.parameters[2]?.keyPath
				? KeyPath.isWritable(this.component[param as keyof typeof this.component], this.parameters[2].keyPath)
				: Object.isWritable(this.component, param as string)

		const targetWritable = Object.isWritable(this.component, this.targetProperty)

		return sourceWritable && targetWritable
			? BindingMode.TwoWay
			: sourceWritable
				? BindingMode.OneWayToSource
				: BindingMode.OneWay
	}

	get event() {
		return this.parameters[2]?.event ?? getAssociatedEvent(this.element, this.targetProperty)
	}

	get dispatchChangeEvent() {
		return this.parameters[2]?.dispatchChangeEvent ?? false
	}

	get value() {
		const value = this.property.get?.()
		if (this.dispatchChangeEvent && this.mode !== BindingMode.OneWayToSource) {
			this.dispatchAssociatedEvent(value)
		}
		return value
	}

	set value(value: unknown) {
		if (this.mode !== BindingMode.OneWay) {
			this.property.set?.(value)

			for (const integration of bindingIntegrations) {
				integration.bind(this)
			}
		}
	}

	private dispatchAssociatedEvent(value: unknown) {
		const eventName = this.event
		const event = new CustomEvent(eventName, {
			detail: value,
			bubbles: true,
			composed: true,
		})
		this.element.dispatchEvent(event)
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
		const value = e instanceof CustomEvent
			? e.detail
			: (e.target as any)[this.targetProperty]
		this.sourceUpdate?.call(this.component, value)
		this.value = value
		if (this.sourceKey) {
			this.component.requestUpdate(this.sourceKey)
		}
		this.sourceUpdated?.call(this.component, value)
	}
}