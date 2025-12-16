import { Component, HTMLElementEventDispatcher, PureEventDispatcher, component } from '../index.js'
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

			const expectCustomEvent = (correctEvent: string, incorrectEvent: keyof typeof fixture.component) => {
				const listeners = {
					correct: jasmine.createSpy('correct'),
					incorrect: jasmine.createSpy('incorrect'),
				}
				fixture.component.addEventListener(correctEvent, listeners.correct)
				fixture.component.addEventListener(incorrectEvent, listeners.incorrect)

				fixture.component[incorrectEvent].dispatch('test')

				expect(listeners.incorrect).not.toHaveBeenCalled()
				expect(listeners.correct).toHaveBeenCalledTimes(1)
				const event = listeners.correct.calls.argsFor(0)[0] as CustomEvent<string>
				expect(event.type).toBe(correctEvent)
				expect(event.detail).toBe('test')

				fixture.component.removeEventListener(correctEvent, listeners.correct)
				listeners.correct.calls.reset()
				fixture.component[incorrectEvent].dispatch('test2')
				expect(listeners.correct).not.toHaveBeenCalled()
				expect(listeners.incorrect).not.toHaveBeenCalled()
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
})