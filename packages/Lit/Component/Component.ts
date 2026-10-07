import { LitElement, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'
import { html } from './html.js'
import { Hydration } from './Hydration.js'
import './hydrateAttributes.js'

export const component = customElement

export abstract class Component extends LitElement {
	private readonly hydration = new Hydration(this)

	/**
	 * Whether the component renders its first update in the browser on top of the server's render, which it must reproduce,
	 * as hydration keeps the server's text and template choices and the server saw no light DOM.
	 * Another update follows at once, and every slot with content signals a `slotchange` then, which the browser did not.
	 */
	get hydrating() {
		return this.hydration.hydrating
	}

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

	protected override update(props: PropertyValues) {
		super.update(props)
		this.hydration.hostUpdate()
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
