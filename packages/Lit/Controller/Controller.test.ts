import { type ReactiveController } from 'lit'
import { Controller } from './Controller.js'
import { Component } from '../Component/index.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

class ControllerTestComponent extends Component {
	readonly controllers = new Set<ReactiveController>()

	override addController(controller: ReactiveController) {
		this.controllers.add(controller)
		super.addController(controller)
	}
}
customElements.define('controller-test-component', ControllerTestComponent)

describe('Controller', () => {
	const fixture = new ComponentTestFixture<ControllerTestComponent>('controller-test-component')

	it('should add itself as a controller', () => {
		class TestController extends Controller { }

		expect(fixture.component.controllers.size).toBe(0)

		const controller = new TestController(fixture.component)

		expect(fixture.component.controllers.size).toBe(1)
		expect(fixture.component.controllers.has(controller)).toBeTrue()
	})

	describe('construction on an already connected host', () => {
		// `ReactiveControllerHost.addController` invokes `hostConnected` synchronously when the host
		// is already connected, so that a controller which is added late does not miss the callback.
		// As `Controller` registers itself in its base constructor, this call is re-entrant: it runs
		// before a subclass has initialized its own members. These tests pin this behavior down, so
		// that changing it is a deliberate decision rather than an accident.

		let hostConnectedCalls = new Array<string | undefined>()
		beforeEach(() => hostConnectedCalls = new Array<string | undefined>())

		class LateController extends Controller {
			private readonly dependency = 'initialized'

			override hostConnected() {
				hostConnectedCalls.push(this.dependency)
			}
		}

		it('should invoke hostConnected re-entrantly during construction, before subclass members are initialized', () => {
			const controller = new LateController(fixture.component)

			expect(fixture.component.controllers.has(controller)).toBeTrue()
			expect(hostConnectedCalls).toEqual([undefined])
		})

		it('should not invoke hostConnected during construction when the host is not yet connected', () => {
			const component = new ControllerTestComponent()
			const controller = new LateController(component)

			expect(component.controllers.has(controller)).toBeTrue()
			expect(hostConnectedCalls.length).toBe(0)

			document.body.append(component)

			expect(hostConnectedCalls).toEqual(['initialized'])
			component.remove()
		})
	})

	describe('initializers', () => {
		it('should be called when a controller is constructed', () => {
			class TestController extends Controller { }
			const spy = jasmine.createSpy('initializer')
			TestController.addInitializer(spy)

			expect(spy).not.toHaveBeenCalled()

			const controller = new TestController(fixture.component)

			expect(spy).toHaveBeenCalledOnceWith(controller)
		})

		it('should inherit initializers from parent classes', () => {
			const spy1 = jasmine.createSpy('initializer1')
			const spy2 = jasmine.createSpy('initializer2')
			class TestController1 extends Controller { }
			TestController1.addInitializer(spy1)
			class TestController2 extends TestController1 { }
			TestController2.addInitializer(spy2)

			expect(spy1).not.toHaveBeenCalled()
			expect(spy2).not.toHaveBeenCalled()

			const controller = new TestController2(fixture.component)

			expect(spy1).toHaveBeenCalledOnceWith(controller)
			expect(spy2).toHaveBeenCalledOnceWith(controller)
		})
	})
})