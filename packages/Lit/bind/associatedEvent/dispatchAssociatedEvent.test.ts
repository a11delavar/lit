import { Component, ComponentPart, associatedEvent, event, property, state } from '../../index.js'
import { dispatchAssociatedEvent } from './dispatchAssociatedEvent.js'

describe('dispatchAssociatedEvent', () => {
	const record = (target: EventTarget, type: string) => {
		const received = new Array<unknown>()
		target.addEventListener(type, (e: Event) => received.push((e as CustomEvent).detail))
		return received
	}

	it('should dispatch the associated event on the source itself', () => {
		class TestElement extends Component {
			@event() readonly change!: EventDispatcher<string>
			@property() value = ''
		}
		customElements.define('test-element-dispatch-associated-event-1', TestElement)

		const element = new TestElement()
		const received = record(element, 'change')

		expect(dispatchAssociatedEvent(element, 'value', 'foo')).toBe(true)
		expect(received).toEqual(['foo'])
	})

	it('should dispatch through the associated dispatcher, honoring its customized DOM event type', () => {
		class TestElement extends Component {
			@event({ type: 'value-change' }) readonly valueChange!: EventDispatcher<string>
			@property() value = ''
		}
		customElements.define('test-element-dispatch-associated-event-2', TestElement)

		const element = new TestElement()
		const received = record(element, 'value-change')
		const notReceived = record(element, 'valueChange')

		expect(dispatchAssociatedEvent(element, 'value', 'foo')).toBe(true)
		expect(received).toEqual(['foo'])
		expect(notReceived).toEqual([])
	})

	it('should dispatch through the associated dispatcher, honoring its event options', () => {
		class TestElement extends Component {
			@event({ bubbles: true, composed: true }) readonly fooChange!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-dispatch-associated-event-3', TestElement)

		const element = new TestElement()
		document.body.appendChild(element)
		const received = record(document.body, 'fooChange')

		expect(dispatchAssociatedEvent(element, 'foo', 'bar')).toBe(true)
		expect(received).toEqual(['bar'])

		element.remove()
	})

	it('should dispatch a custom event on the source when the association has no dispatcher backing it', () => {
		class TestElement extends Component {
			@associatedEvent('foo-changed')
			@property() foo = ''
		}
		customElements.define('test-element-dispatch-associated-event-4', TestElement)

		const element = new TestElement()
		const received = record(element, 'foo-changed')

		expect(dispatchAssociatedEvent(element, 'foo', 'bar')).toBe(true)
		expect(received).toEqual(['bar'])
	})

	it('should not dispatch anything when the property has no associated event', () => {
		class TestElement extends Component {
			@event() readonly change!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-dispatch-associated-event-5', TestElement)

		const element = new TestElement()
		const received = record(element, 'change')
		const alsoNotReceived = record(element, 'fooChange')

		expect(dispatchAssociatedEvent(element, 'foo', 'bar')).toBe(false)
		expect(received).toEqual([])
		expect(alsoNotReceived).toEqual([])
	})

	it('should dispatch on the host element when the source is a component part', () => {
		class TestPart extends ComponentPart {
			@event() readonly valueChange!: EventDispatcher<string>
			@state() value = ''
		}

		class TestElement extends Component {
			readonly testPart = new TestPart(this)
		}
		customElements.define('test-element-dispatch-associated-event-6', TestElement)

		const element = new TestElement()
		const received = record(element, 'valueChange')

		expect(dispatchAssociatedEvent(element.testPart, 'value', 'foo')).toBe(true)
		expect(received).toEqual(['foo'])
	})

	it('should not dispatch anything for a source which is not an event target', () => {
		expect(dispatchAssociatedEvent({ value: '' }, 'value', 'foo')).toBe(false)
	})
})
