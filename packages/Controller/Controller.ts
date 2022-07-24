import { ReactiveController, ReactiveControllerHost } from 'lit'

export abstract class Controller implements ReactiveController {
	constructor(protected readonly host: ReactiveControllerHost) {
		this.host.addController(this)
	}

	hostConnected?(): void
	hostDisconnected?(): void
	hostUpdate?(): void
	hostUpdated?(): void
}