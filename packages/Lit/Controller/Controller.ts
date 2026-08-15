import { type ReactiveController, type ReactiveControllerHost } from 'lit'
import { host, type HostProvider } from '../host.js'

type Initializer = (controller: Controller) => void

export abstract class Controller implements ReactiveController {
	private static _initializers?: Set<Initializer>
	static addInitializer(initializer: Initializer) {
		(this._initializers ??= new Set(Object.getPrototypeOf(this).initializers ?? [])).add(initializer)
	}

	constructor(protected readonly host: ReactiveControllerHost) {
		this.host.addController(this);
		(this.constructor as typeof Controller)._initializers?.forEach(initializer => initializer(this))
	}

	get [host]() {
		return (this.host as unknown as HostProvider)[host]
	}

	hostConnected?(): void
	hostDisconnected?(): void
	hostUpdate?(): void
	hostUpdated?(): void
}