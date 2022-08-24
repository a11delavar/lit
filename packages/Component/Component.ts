import { LitElement, PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'
import { nothing } from '.'

export const component = customElement

// @ts-expect-error Until TypeScript supports "final" methods this masks the those methods.
export abstract class Component extends LitElement {
	/** Invoked after first update i.e. render is completed */
	protected initialized() { }

	/** Invoked every time the component is connected to the Document Object Model (DOM) */
	protected connected() { }

	/** Invoked every time the component is disconnected from the Document Object Model (DOM) */
	protected disconnected() { }

	protected get template() {
		return nothing
	}

	// @ts-expect-error Final method
	private override firstUpdated(props: PropertyValues) {
		super.firstUpdated(props)
		this.initialized()
	}

	// @ts-expect-error Final method
	private override render() {
		return this.template
	}

	// @ts-expect-error Final method
	private override connectedCallback() {
		super.connectedCallback()
		this.connected()
	}

	// @ts-expect-error Final method
	private override disconnectedCallback() {
		super.disconnectedCallback()
		this.disconnected()
	}
}