import { ReactiveController, ReactiveControllerHost, ReactiveElement } from 'lit'

export abstract class Controller implements ReactiveController {
	private static readonly initializers = new Set<(element: ReactiveElement) => void>()

	static addInitializer(initializer: (host: ReactiveElement) => void) {
		this.initializers.add(initializer)
	}

	constructor(readonly host: ReactiveControllerHost) {
		if (this.host instanceof ReactiveElement) {
			for (const initializer of (this.constructor as typeof Controller).initializers) {
				setTimeout(() => initializer(this.host as ReactiveElement), 1000)
			}
		}
		this.host.addController(this)
	}

	hostConnected?(): void
	hostDisconnected?(): void
	hostUpdate?(): void
	hostUpdated?(): void
}