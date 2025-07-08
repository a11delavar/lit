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