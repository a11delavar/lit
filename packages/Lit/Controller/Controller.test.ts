import { ReactiveController } from 'lit'
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

class TestController extends Controller { }

describe('Controller', () => {
	const fixture = new ComponentTestFixture<ControllerTestComponent>('controller-test-component')

	it('should add itself as a controller', () => {
		expect(fixture.component.controllers.size).toBe(0)

		const controller = new TestController(fixture.component)

		expect(fixture.component.controllers.size).toBe(1)
		expect(fixture.component.controllers.has(controller)).toBeTrue()
	})
})