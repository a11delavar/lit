import { LitElement, PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'
import { nothing } from '.'

export const component = customElement

export abstract class Component extends LitElement {
	/** Invoked after first update i.e. render is completed */
	protected initialized() { }

	/** Invoked every time the component is connected to the Document Object Model (DOM) */
	protected connected() { }

	/** Invoked every time the component is disconnected from the Document Object Model (DOM) */
	protected disconnected() { }

	/** The template rendered into renderRoot. Invoked on each update to perform rendering tasks. */
	protected get template() {
		return nothing
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