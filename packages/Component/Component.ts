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

	/** @deprecated Use template getter instead */
	protected override render() {
		return this.template
	}

	protected get template() {
		return nothing
	}

	override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.initialized()
	}

	override connectedCallback() {
		super.connectedCallback()
		this.connected()
	}

	override disconnectedCallback() {
		super.disconnectedCallback()
		this.disconnected()
	}
}