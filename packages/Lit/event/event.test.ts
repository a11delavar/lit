import { Component, Controller, HTMLElementEventDispatcher, PureEventDispatcher, component } from '../index.js'
import { event } from './event.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

describe(event.name, () => {
	describe('on non HTMLElement objects', () => {
		class TestClass {
			@event() readonly activation!: EventDispatcher<string>

			activate() {
				this.activation.dispatch('test')
			}
		}

		const object = new TestClass()

		it('should create event dispatcher getter accessor', () => {
			expect(() => (object.activation as any) = null).toThrow()
		})

		it('should return the same instance', () => {
			expect(object.activation).toBe(object.activation)
		})

		it(`should create an ${PureEventDispatcher.name}`, () => {
			expect(object.activation).toBeInstanceOf(PureEventDispatcher)
		})
	})

	describe('on HTMLElement objects', () => {
		@component('lit-test-event')
		class TestComponent extends Component {
			@event() readonly activation!: EventDispatcher<string>

			activate() {
				this.activation.dispatch('test')
			}
		}

		const c = new TestComponent()

		it('should create event dispatcher getter accessor', () => {
			expect(() => (c.activation as any) = null).toThrow()
		})

		it('should return the same instance', () => {
			expect(c.activation).toBe(c.activation)
		})

		it(`should create an ${HTMLElementEventDispatcher.name}`, () => {
			expect(c.activation).toBeInstanceOf(HTMLElementEventDispatcher)
		})

		describe('with explicit type option', () => {
			@component('lit-test-event-custom-type')
			class CustomTypeComponent extends Component {
				@event({ type: 'custom' }) readonly customEvent!: EventDispatcher<string>
				@event({ type: 'kebab-case-event' }) readonly kebabEvent!: EventDispatcher<string>
				@event({ type: 'namespace:event' }) readonly namespacedEvent!: EventDispatcher<string>
			}

			const fixture = new ComponentTestFixture(() => new CustomTypeComponent())

			const expectCustomEvent = (expectedEvent: string, property: keyof typeof fixture.component) => {
				const listeners = {
					expected: jasmine.createSpy('expected'),
					unexpected: jasmine.createSpy('unexpected'),
				}
				fixture.component.addEventListener(expectedEvent, listeners.expected)
				fixture.component.addEventListener(property, listeners.unexpected)

				fixture.component[property].dispatch('test')

				expect(listeners.unexpected).not.toHaveBeenCalled()
				expect(listeners.expected).toHaveBeenCalledTimes(1)
				const event = listeners.expected.calls.argsFor(0)[0] as CustomEvent<string>
				expect(event.type).toBe(expectedEvent)
				expect(event.detail).toBe('test')

				fixture.component.removeEventListener(expectedEvent, listeners.expected)
				listeners.expected.calls.reset()
				fixture.component[property].dispatch('test2')
				expect(listeners.expected).not.toHaveBeenCalled()
				expect(listeners.unexpected).not.toHaveBeenCalled()
			}

			it('should dispatch native event with custom type name', () => {
				expectCustomEvent('custom', 'customEvent')
			})

			it('should handle kebab-case type', () => {
				expectCustomEvent('kebab-case-event', 'kebabEvent')
			})

			it('should handle namespaced type', () => {
				expectCustomEvent('namespace:event', 'namespacedEvent')
			})
		})
	})

	describe('on Controller objects', () => {
		class TestController extends Controller {
			@event() readonly activation!: EventDispatcher<string>

			constructor(override readonly host: ControllerEventTestComponent) {
				super(host)
			}

			activate() {
				this.activation.dispatch('test')
			}
		}

		@component('lit-test-event-controller')
		class ControllerEventTestComponent extends Component {
			readonly controller = new TestController(this)
		}

		const fixture = new ComponentTestFixture(() => new ControllerEventTestComponent())

		it(`should create an ${HTMLElementEventDispatcher.name}`, () => {
			expect(fixture.component.controller.activation).toBeInstanceOf(HTMLElementEventDispatcher)
		})

		it('should return the same instance', () => {
			expect(fixture.component.controller.activation).toBe(fixture.component.controller.activation)
		})

		it('should dispatch the event from the host element', () => {
			const listener = jasmine.createSpy('activation')
			fixture.component.addEventListener('activation', listener)

			fixture.component.controller.activate()

			expect(listener).toHaveBeenCalledTimes(1)
			expect((listener.calls.argsFor(0)[0] as CustomEvent<string>).detail).toBe('test')
		})
	})
})