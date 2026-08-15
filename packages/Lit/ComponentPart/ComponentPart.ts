import { type HTMLTemplateResult, type ReactiveElement } from 'lit'
import { Controller } from '../Controller/index.js'
import { html } from '../Component/html.js'
import { requestHostUpdate } from '../updated/requestHostUpdate.js'

/**
 * A part of a component, extracted into a class of its own without introducing a component boundary.
 *
 * A part contributes a `template` to its host and may declare its own state, queries, events and
 * event listeners with the very same decorators a component uses. As a part shares the update
 * lifecycle of its host, changing its state re-renders the host as a whole - no properties have to
 * be passed down and no updates have to be propagated by hand.
 *
 * This makes a part the tool of choice to break up a large component, whereas a component should be
 * introduced whenever the extracted unit is reusable on its own.
 */
export abstract class ComponentPart<THost extends ReactiveElement = ReactiveElement> extends Controller {
	constructor(protected override readonly host: THost) {
		super(host)
	}

	/** The template of the part which its host renders. */
	get template(): HTMLTemplateResult {
		return html.nothing
	}

	/**
	 * Requests an update of the host.
	 *
	 * When a property key is provided, the change is tracked in the host's `changedProperties`
	 * by a key unique to this part and property, so that it can neither collide with a property
	 * of the host nor with one of another part.
	 */
	requestUpdate(propertyKey?: PropertyKey, oldValue?: unknown) {
		requestHostUpdate(this, propertyKey, oldValue)
	}
}