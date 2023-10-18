import { LitElement, PropertyValues, ReactiveElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { html } from './html.js'

export const component = customElement

const originalUpdate = ReactiveElement.prototype['update']
ReactiveElement.prototype['update'] = function (changedProperties: PropertyValues) {
	(this as any)._changedProperties = changedProperties
	return originalUpdate.call(this, changedProperties)
}

export abstract class Component extends LitElement {
	private _changedProperties?: PropertyValues<this>
	get changedProperties() { return this._changedProperties }

	/** Invoked after first update i.e. render is completed */
	protected initialized() { }

	/** Invoked every time the component is connected to the Document Object Model (DOM) */
	protected connected() { }

	/** Invoked every time the component is disconnected from the Document Object Model (DOM) */
	protected disconnected() { }

	/** The template rendered into renderRoot. Invoked on each update to perform rendering tasks. */
	protected get template() {
		return html.nothing
	}

	/** @final */
	protected override render() {
		return this.template
	}

	/** @final */
	protected override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.initialized()
	}

	/** @final */
	override connectedCallback() {
		super.connectedCallback()
		this.connected()
	}

	/** @final */
	override disconnectedCallback() {
		super.disconnectedCallback()
		this.disconnected()
	}
}