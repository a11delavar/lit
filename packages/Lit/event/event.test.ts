import { Component, HTMLElementEventDispatcher, PureEventDispatcher, component } from '../index.js'
import { event } from './event.js'

describe(event.name, () => {
	describe('on element objects', () => {
		class TestClass {
			@event() readonly activation!: EventDispatcher<string>

			activate() {
				this.activation.dispatch('test')
			}
		}

		const object = new TestClass()

		describe('on non HTMLElement objects', () => {
			it('should create event dispatcher getter accessor', () => {
				// @ts-expect-error - testing that setting the property throws an error
				expect(() => sut.activation = null as any).toThrow()
			})

			it('should return the same instance', () => {
				expect(object.activation).toBe(object.activation)
			})

			it(`should create an ${PureEventDispatcher.name}`, () => {
				expect(object.activation).toBeInstanceOf(PureEventDispatcher)
			})
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

		describe('on HTMLElement objects', () => {
			it('should create event dispatcher getter accessor', () => {
				// @ts-expect-error - testing that setting the property throws an error
				expect(() => sut.activation = null as any).toThrow()
			})

			it('should return the same instance', () => {
				expect(c.activation).toBe(c.activation)
			})

			it(`should create an ${HTMLElementEventDispatcher.name}`, () => {
				expect(c.activation).toBeInstanceOf(HTMLElementEventDispatcher)
			})
		})
	})
})