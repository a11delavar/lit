import { ReactiveController, ReactiveControllerHost } from 'lit'

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

	hostConnected?(): void
	hostDisconnected?(): void
	hostUpdate?(): void
	hostUpdated?(): void
}