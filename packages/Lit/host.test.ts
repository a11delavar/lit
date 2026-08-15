import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, Controller, host, type HostProvider, type ReactiveController, type ReactiveControllerHost } from './index.js'

@component('lit-test-host')
class HostTestComponent extends Component { }

class HostTestController extends Controller {
	constructor(override readonly host: HostTestComponent) {
		super(host)
	}
}

/** A host which is not an element itself but delegates to one. */
class DelegatingHost implements ReactiveControllerHost, HostProvider {
	constructor(private readonly element: HostTestComponent) { }

	get [host]() { return this.element }

	addController(controller: ReactiveController) { this.element.addController(controller) }
	removeController(controller: ReactiveController) { this.element.removeController(controller) }
	requestUpdate() { this.element.requestUpdate() }
	get updateComplete() { return this.element.updateComplete }
}

class DelegatingHostTestController extends Controller {
	constructor(override readonly host: DelegatingHost) {
		super(host)
	}
}

describe('host', () => {
	const fixture = new ComponentTestFixture(() => new HostTestComponent())

	it('should resolve a reactive element to itself', () => {
		expect(fixture.component[host]).toBe(fixture.component)
	})

	it('should resolve a controller to its host', () => {
		const controller = new HostTestController(fixture.component)

		expect(controller[host]).toBe(fixture.component)
	})

	it('should resolve a controller of a delegating host to the element it delegates to', () => {
		const controller = new DelegatingHostTestController(new DelegatingHost(fixture.component))

		expect(controller[host]).toBe(fixture.component)
	})
})