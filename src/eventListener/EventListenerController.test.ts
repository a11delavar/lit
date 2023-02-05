import { ComponentTestFixture } from '../test/ComponentTestFixture.js'
import { component, Component, EventListenerTarget, html, queryAsync } from '../index.js'
import { EventListenerController, extractEventTargets } from './EventListenerController.js'

abstract class EventListenerControllerTestComponent extends Component {
	readonly fakeCall = jasmine.createSpy('fakeCall')
	handlerThis!: this
	handlerEvent!: Event
	handleEvent(e: Event) {
		this.fakeCall()
		this.handlerEvent = e
		this.handlerThis = this
	}

	abstract readonly eventListenerController: EventListenerController

	@queryAsync('ul') readonly ul!: Promise<HTMLUListElement>

	override get template() {
		return html`
			<ul>
				<li>One</li>
				<li>Two</li>
				<li>Three</li>
			</ul>
		`
	}
}

describe('EventListenerController', () => {
	describe('used as method', () => {
		@component('lit-test-event-listener-controller-used-as-method')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, 'click', this.handleEvent.bind(this))
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture })
	})

	describe('used as arrow function', () => {
		@component('lit-test-event-listener-controller-used-as-arrow-function')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, 'click', e => this.handleEvent(e))
		}
		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture })
	})

	describe('used on custom target', () => {
		const target = window

		@component('lit-test-event-listener-controller-used-on-custom-target')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, {
				target,
				type: 'click',
				listener: this.handleEvent.bind(this),
			})
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom target getter', () => {
		function target(this: EventListenerControllerTestComponent) {
			return this.ul
		}

		@component('lit-test-event-listener-controller-used-on-custom-target-getter')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, {
				target,
				type: 'click',
				listener: this.handleEvent.bind(this),
			})
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom iterable target', () => {
		const target = [document, window]

		@component('lit-test-event-listener-controller-used-on-custom-iterable-target')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, {
				target,
				type: 'click',
				listener: this.handleEvent.bind(this),
			})
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom iterable target getter', () => {
		async function target(this: EventListenerControllerTestComponent) {
			const e = await this.ul
			return e.querySelectorAll('li')
		}

		@component('lit-test-event-listener-controller-used-on-custom-iterable-target-getter')
		class TestComponent extends EventListenerControllerTestComponent {
			readonly eventListenerController = new EventListenerController(this, {
				target: target,
				type: 'click',
				listener: this.handleEvent.bind(this),
			})
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	function test(specs: {
		fixture: ComponentTestFixture<EventListenerControllerTestComponent>
		event?: Event
		target?: EventListenerTarget
	}) {
		const event = specs.event ?? new PointerEvent('click')

		const dispatchEvent = async () => {
			const targets = await extractEventTargets.call(specs.fixture.component, specs.target)
			targets.forEach(t => t.dispatchEvent(event))
			return targets.length
		}

		it('calls the method', async () => {
			const length = await dispatchEvent()
			expect(specs.fixture.component.fakeCall).toHaveBeenCalledTimes(length)
		})

		it('bounds the method to the component', async () => {
			await dispatchEvent()
			expect(specs.fixture.component.handlerThis).toBe(specs.fixture.component)
		})

		it('passes the event as the first argument', async () => {
			await dispatchEvent()
			expect(specs.fixture.component.handlerEvent).toBe(event)
		})

		it('removes the event listener on disconnect', async () => {
			specs.fixture.component.remove()
			await dispatchEvent()
			expect(specs.fixture.component.fakeCall).toHaveBeenCalledTimes(0)
		})
	}
})