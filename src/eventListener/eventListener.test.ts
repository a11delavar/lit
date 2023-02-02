import { eventListener, Component, component } from '../index.js'
import { ComponentTestFixture } from '../../test/ComponentTestFixture.js'

describe('@eventListener()', () => {
	describe('used as method', () => {
		@component('lit-test-event-listener-used-as-method')
		class EventListenerUsedAsMethod extends Component {
			readonly fakeCall = jasmine.createSpy('fakeCall')
			handlerThis!: this
			handlerEvent!: Event

			@eventListener('click')
			protected handleClick(e: Event) {
				this.fakeCall()
				this.handlerEvent = e
				this.handlerThis = this
			}
		}

		const fixture = new ComponentTestFixture(() => new EventListenerUsedAsMethod())
		const event = new PointerEvent('click')
		beforeEach(() => fixture.component.dispatchEvent(event))

		it('calls the method', () => expect(fixture.component.fakeCall).toHaveBeenCalled())
		it('bounds the method to the component', () => expect(fixture.component.handlerThis).toBe(fixture.component))
		it('passes the event as the first argument', () => expect(fixture.component.handlerEvent).toBe(event))
	})

	describe('used as arrow function', () => {
		@component('lit-test-event-listener-used-as-arrow-function')
		class EventListenerUsedAsArrowFunction extends Component {
			readonly fakeCall = jasmine.createSpy('fakeCall')
			handlerThis!: this
			handlerEvent!: Event

			@eventListener('click')
			protected handleClick = (e: Event) => {
					this.fakeCall()
					this.handlerEvent = e
					this.handlerThis = this
				}
		}

		const fixture = new ComponentTestFixture(() => new EventListenerUsedAsArrowFunction())
		const event = new PointerEvent('click')
		beforeEach(() => fixture.component.dispatchEvent(event))

		it('calls the method', () => expect(fixture.component.fakeCall).toHaveBeenCalled())
		it('bounds the method to the component', () => expect(fixture.component.handlerThis).toBe(fixture.component))
		it('passes the event as the first argument', () => expect(fixture.component.handlerEvent).toBe(event))
	})
})