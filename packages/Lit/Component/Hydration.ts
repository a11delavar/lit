import { isServer, type ReactiveControllerHost } from 'lit'

/**
 * Tracks the first update of a server-rendered host, which must give what the server gave, and lets it catch up right after:
 * with another update, and a `slotchange` from every slot with content, which the browser signals only for content it assigned itself.
 *
 * The host drives it from `update()` rather than registering it as a controller, so that it acts before any controller of the host
 * reads the light DOM in `hostUpdated`, and is not counted among the host's controllers.
 */
export class Hydration {
	hydrating: boolean

	constructor(private readonly host: ReactiveControllerHost & Element) {
		// A shadow root at construction is the server's, as Lit attaches one only on connection
		this.hydrating = !isServer && !!host.shadowRoot
	}

	hostUpdate() {
		if (this.hydrating) {
			this.hydrating = false
			this.host.updateComplete.then(() => this.hydrated())
		}
	}

	private hydrated() {
		this.host.requestUpdate()
		for (const slot of this.host.shadowRoot?.querySelectorAll('slot') ?? []) {
			if (slot.assignedNodes().length > 0) {
				slot.dispatchEvent(new Event('slotchange', { bubbles: true }))
			}
		}
	}
}
