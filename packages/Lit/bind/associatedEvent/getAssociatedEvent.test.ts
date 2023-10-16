import { Component, property, associatedEvent, event } from '../../index.js'
import { getAssociatedEvent } from './getAssociatedEvent.js'

describe('getAssociatedEvent', () => {
	it('should return the explicitly associated event if given', () => {
		class TestElement extends Component {
			@associatedEvent('foo-changed')
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-1', TestElement)

		const element = new TestElement()
		const event = getAssociatedEvent(element, 'foo')

		expect(event).toBe('foo-changed')
	})

	it('should return the explicitly associated event if given through @property integration', () => {
		class TestElement extends Component {
			@property({ event: 'foo-changed' }) foo = ''
		}
		customElements.define('test-element-get-associated-event-2', TestElement)

		const element = new TestElement()
		const event = getAssociatedEvent(element, 'foo')

		expect(event).toBe('foo-changed')
	})

	it('should return the event dispatcher key if such a dispatcher is registered with `[property]Change` key', () => {
		class TestElement extends Component {
			@event() readonly fooChange!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-3', TestElement)

		const element = new TestElement()
		const e = getAssociatedEvent(element, 'foo')

		expect(e).toBe('fooChange')
	})

	it('should return the default event if no explicitly associated event is given', () => {
		class TestElement extends Component {
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-4', TestElement)

		const element = new TestElement()
		const event = getAssociatedEvent(element, 'foo')

		expect(event).toBe('change')
	})
})