import { Component, property, associatedEvent, event } from '../../index.js'
import { defaultAssociatedEvent, findAssociatedEvent, findAssociatedEventDispatcher, getAssociatedEvent } from './getAssociatedEvent.js'

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

		expect(event).toBe(defaultAssociatedEvent)
	})

	it('should return the customized DOM event type instead of the dispatcher key', () => {
		class TestElement extends Component {
			@event({ type: 'foo-change' }) readonly fooChange!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-5', TestElement)

		const element = new TestElement()

		expect(getAssociatedEvent(element, 'foo')).toBe('foo-change')
	})

	it('should resolve the event which the associated dispatcher actually dispatches', () => {
		class TestElement extends Component {
			@event({ type: 'foo-change' }) readonly fooChange!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-6', TestElement)

		const element = new TestElement()
		const received = new Array<string>()
		element.addEventListener(getAssociatedEvent(element, 'foo'), (e: Event) => received.push((e as CustomEvent<string>).detail))
		element.fooChange.dispatch('bar')

		expect(received).toEqual(['bar'])
	})

	it('should associate a "value" property with the "change" dispatcher', () => {
		class TestElement extends Component {
			@event() readonly change!: EventDispatcher<string>
			@property() value = ''
		}
		customElements.define('test-element-get-associated-event-7', TestElement)

		const element = new TestElement()

		expect(getAssociatedEvent(element, 'value')).toBe('change')
	})

	it('should prefer the "[property]Change" dispatcher over the "change" dispatcher for a "value" property', () => {
		class TestElement extends Component {
			@event() readonly change!: EventDispatcher<string>
			@event() readonly valueChange!: EventDispatcher<string>
			@property() value = ''
		}
		customElements.define('test-element-get-associated-event-8', TestElement)

		const element = new TestElement()

		expect(getAssociatedEvent(element, 'value')).toBe('valueChange')
	})

	it('should not associate a non-"value" property with the "change" dispatcher', () => {
		class TestElement extends Component {
			@event() readonly change!: EventDispatcher<string>
			@property() foo = ''
		}
		customElements.define('test-element-get-associated-event-9', TestElement)

		const element = new TestElement()

		expect(findAssociatedEvent(element, 'foo')).toBe(undefined)
	})
})

describe('findAssociatedEvent', () => {
	it('should return undefined instead of falling back to the default associated event', () => {
		class TestElement extends Component {
			@property() foo = ''
		}
		customElements.define('test-element-find-associated-event-1', TestElement)

		const element = new TestElement()

		expect(findAssociatedEvent(element, 'foo')).toBe(undefined)
		expect(getAssociatedEvent(element, 'foo')).toBe(defaultAssociatedEvent)
	})

	it('should return the explicitly associated event even without a dispatcher backing it', () => {
		class TestElement extends Component {
			@associatedEvent('foo-changed')
			@property() foo = ''
		}
		customElements.define('test-element-find-associated-event-2', TestElement)

		const element = new TestElement()

		expect(findAssociatedEvent(element, 'foo')).toBe('foo-changed')
		expect(findAssociatedEventDispatcher(element, 'foo')).toBe(undefined)
	})

	it('should resolve the dispatcher an explicit association points to', () => {
		class TestElement extends Component {
			@event({ type: 'foo-change' }) readonly fooChanged!: EventDispatcher<string>
			@associatedEvent('fooChanged')
			@property() foo = ''
		}
		customElements.define('test-element-find-associated-event-3', TestElement)

		const element = new TestElement()

		expect(findAssociatedEventDispatcher(element, 'foo')).toBe(element.fooChanged as any)
		expect(findAssociatedEvent(element, 'foo')).toBe('foo-change')
	})

	it('should not resolve anything for a source which is not an event target', () => {
		expect(findAssociatedEvent({ value: '' }, 'value')).toBe(undefined)
		expect(findAssociatedEventDispatcher({ value: '' }, 'value')).toBe(undefined)
	})
})
