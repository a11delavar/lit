import { eventListener, Component, component, html, EventListenerTarget, queryAsync } from '../index.js'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { extractEventTargets } from './EventListenerController.js'

abstract class EventListenerTestComponent extends Component {
	readonly fakeCall = jasmine.createSpy('fakeCall')
	handlerThis!: this
	handlerEvent!: Event
	handleEvent(e: Event) {
		this.fakeCall()
		this.handlerEvent = e
		this.handlerThis = this
	}

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

describe(eventListener.name, () => {
	describe('used as method', () => {
		@component('lit-test-event-listener-used-as-method')
		class TestComponent extends EventListenerTestComponent {
			@eventListener('click')
			protected handleClick(e: Event) {
				super.handleEvent(e)
			}
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture })
	})

	describe('used as arrow function', () => {
		@component('lit-test-event-listener-used-as-arrow-function')
		class TestComponent extends EventListenerTestComponent {
			@eventListener('click')
			protected handleClick = (e: Event) => super.handleEvent(e)
		}
		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture })
	})

	describe('used on custom target', () => {
		const target = window

		@component('lit-test-event-listener-used-on-custom-target')
		class TestComponent extends EventListenerTestComponent {
			@eventListener({ target, type: 'click' })
			protected handleClick(e: Event) {
				super.handleEvent(e)
			}
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom target getter', () => {
		function target(this: EventListenerTestComponent) {
			return this.ul
		}

		@component('lit-test-event-listener-used-on-custom-target-getter')
		class TestComponent extends EventListenerTestComponent {
			@eventListener({ target, type: 'click' })
			protected handleClick(e: Event) {
				super.handleEvent(e)
			}
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom iterable target', () => {
		const target = [document, window]

		@component('lit-test-event-listener-used-on-custom-iterable-target')
		class TestComponent extends EventListenerTestComponent {
			@eventListener({ target, type: 'click' })
			protected handleClick(e: Event) {
				super.handleEvent(e)
			}
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	describe('used on custom iterable target getter', () => {
		async function target(this: EventListenerTestComponent) {
			const e = await this.ul
			return e.querySelectorAll('li')
		}

		@component('lit-test-event-listener-used-on-custom-iterable-target-getter')
		class TestComponent extends EventListenerTestComponent {
			@eventListener({ target, type: 'click' })
			protected handleClick(e: Event) {
				super.handleEvent(e)
			}
		}

		const fixture = new ComponentTestFixture(() => new TestComponent())
		test({ fixture, target })
	})

	function test(specs: {
		fixture: ComponentTestFixture<EventListenerTestComponent>
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