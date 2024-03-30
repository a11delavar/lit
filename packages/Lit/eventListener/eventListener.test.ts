import { eventListener, Component, component, html, EventListenerTarget, queryAsync, Controller } from '../index.js'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { extractEventTargets } from './extractEventTargets.js'

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
	describe('on Component class', () => {
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
	})

	describe('on Controller class', () => {
		abstract class EventListenerTestController extends Controller {
			constructor(readonly host: EventListenerTestComponent) {
				super(host)
			}
		}

		describe('used as method', () => {
			class SampleController extends Controller {
				constructor(readonly host: ComponentWithControllerComponent) {
					super(host)
				}

				@eventListener('click')
				protected handleClick(e: Event) {
					this.host.handleEvent(e)
				}
			}

			@component('lit-test-event-listener-used-on-controller-class')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, context: () => fixture.component.controller })
		})

		describe('used as arrow function', () => {
			class SampleController extends Controller {
				constructor(readonly host: ComponentWithControllerComponent) {
					super(host)
				}

				@eventListener('click')
				protected handleClick = (e: Event) => this.host.handleEvent(e)
			}

			@component('lit-test-event-listener-used-on-controller-arrow-function')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, context: () => fixture.component.controller })
		})

		describe('used on custom target', () => {
			const target = window

			class SampleController extends EventListenerTestController {
				@eventListener({ target, type: 'click' })
				protected handleClick(e: Event) {
					this.host.handleEvent(e)
				}
			}

			@component('lit-test-event-listener-used-on-controller-custom-target')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, target, context: () => fixture.component.controller })
		})

		describe('used on custom target getter', () => {
			function target(this: SampleController) {
				return this.host.ul
			}

			class SampleController extends EventListenerTestController {
				@eventListener({ target, type: 'click' })
				protected handleClick(e: Event) {
					this.host.handleEvent(e)
				}
			}

			@component('lit-test-event-listener-used-on-controller-custom-target-getter')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, target, context: () => fixture.component.controller })
		})

		describe('used on custom iterable target', () => {
			const target = [document, window]

			class SampleController extends EventListenerTestController {
				@eventListener({ target, type: 'click' })
				protected handleClick(e: Event) {
					this.host.handleEvent(e)
				}
			}

			@component('lit-test-event-listener-used-on-controller-custom-iterable-target')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, target, context: () => fixture.component.controller })
		})

		describe('used on custom iterable target getter', () => {
			async function target(this: SampleController) {
				const e = await this.host.ul
				return e.querySelectorAll('li')
			}

			class SampleController extends EventListenerTestController {
				@eventListener({ target, type: 'click' })
				protected handleClick(e: Event) {
					this.host.handleEvent(e)
				}
			}

			@component('lit-test-event-listener-used-on-controller-custom-iterable-target-getter')
			class ComponentWithControllerComponent extends EventListenerTestComponent {
				readonly controller = new SampleController(this)
			}

			const fixture = new ComponentTestFixture(() => new ComponentWithControllerComponent())
			test({ fixture, target, context: () => fixture.component.controller })
		})
	})

	function test(specs: {
		fixture: ComponentTestFixture<EventListenerTestComponent>
		event?: Event
		target?: EventListenerTarget
		context?: () => object
	}) {
		const event = specs.event ?? new PointerEvent('click')

		const dispatchEvent = async () => {
			const targets = await extractEventTargets.call(specs.context?.() ?? specs.fixture.component, specs.fixture.component, specs.target)
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

		it('removes and re-adds the event listener on reconnect', async () => {
			const div = document.createElement('div')
			document.body.appendChild(div)

			div.appendChild(specs.fixture.component)
			const length = await dispatchEvent()

			expect(specs.fixture.component.fakeCall).toHaveBeenCalledTimes(length)
		})
	}
})