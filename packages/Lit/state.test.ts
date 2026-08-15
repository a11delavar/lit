import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, Controller } from './index.js'
import { state } from './state.js'

describe(state.name, () => {
	describe('on a Controller', () => {
		class TestController extends Controller {
			@state() value = 'initial'
			@state({ hasChanged: (value: number, oldValue: number) => Math.abs(value - oldValue) > 1 }) tolerant = 0

			constructor(override readonly host: StateTestComponent) {
				super(host)
			}
		}

		@component('lit-test-state')
		class StateTestComponent extends Component {
			readonly first = new TestController(this)
			readonly second = new TestController(this)
		}

		const fixture = new ComponentTestFixture(() => new StateTestComponent())

		it('should initialize through field initializers', () => {
			expect(fixture.component.first.value).toBe('initial')
		})

		it('should store the value per controller instance', () => {
			fixture.component.first.value = 'changed'

			expect(fixture.component.first.value).toBe('changed')
			expect(fixture.component.second.value).toBe('initial')
		})

		it('should not register the property on the host', () => {
			expect('value' in fixture.component).toBeFalse()
			expect((fixture.component.constructor as typeof Component).elementProperties.has('value')).toBeFalse()
		})

		it('should request an update of the host when the value changes', () => {
			const requestUpdate = spyOn(fixture.component, 'requestUpdate').and.callThrough()

			fixture.component.first.value = 'changed'

			expect(requestUpdate).toHaveBeenCalledTimes(1)
		})

		it('should not request an update of the host when the value does not change', () => {
			const requestUpdate = spyOn(fixture.component, 'requestUpdate').and.callThrough()

			fixture.component.first.value = fixture.component.first.value

			expect(requestUpdate).not.toHaveBeenCalled()
		})

		it('should respect a custom hasChanged', () => {
			const requestUpdate = spyOn(fixture.component, 'requestUpdate').and.callThrough()

			fixture.component.first.tolerant = 1
			expect(requestUpdate).not.toHaveBeenCalled()
			expect(fixture.component.first.tolerant).toBe(1)

			fixture.component.first.tolerant = 5
			expect(requestUpdate).toHaveBeenCalledTimes(1)
		})
	})
})