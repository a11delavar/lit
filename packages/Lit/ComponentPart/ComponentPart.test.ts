import { ComponentTestFixture } from '@a11d/lit-testing'
import { bind, Component, component, event, eventListener, host, html, query, queryAll, state } from '../index.js'
import { ComponentPart } from './ComponentPart.js'

function trackedUpdated(this: CounterPart, value: string, oldValue: string) {
	this.trackedUpdatedCallback(this, value, oldValue)
}

function countUpdated(this: ComponentPartTestComponent, value: number, oldValue: number) {
	this.countUpdatedCallback(value, oldValue)
}

class CounterPart extends ComponentPart<ComponentPartTestComponent> {
	@state() count = 0
	@state({ updated: trackedUpdated }) tracked = 'a'
	@state() text = ''

	readonly trackedUpdatedCallback = jasmine.createSpy('trackedUpdated')
	readonly clickCallback = jasmine.createSpy('click')

	@query('#count') readonly countElement!: HTMLSpanElement | undefined
	@queryAll('.item') readonly itemElements!: Array<HTMLSpanElement>

	@event() readonly countChange!: EventDispatcher<number>

	@eventListener('click')
	protected handleClick() {
		this.clickCallback()
	}

	override get template() {
		return html`
			<span id='count'>${this.count}</span>
			<span class='item'></span>
			<span class='item'></span>
			<input id='text' ${bind(this, 'text')}>
		`
	}

	increment() {
		this.count++
		this.host.total++
		this.countChange.dispatch(this.count)
	}
}

class LabelPart extends ComponentPart<ComponentPartTestComponent> {
	readonly name: string

	@state() visible = false

	constructor(host: ComponentPartTestComponent, name: string) {
		super(host)
		this.name = name
	}

	override get template() {
		return html`<span class='label'>${this.visible ? this.name : ''}</span>`
	}
}

@component('lit-test-component-part')
class ComponentPartTestComponent extends Component {
	@state() total = 0
	@state({ updated: countUpdated }) count = 100

	readonly countUpdatedCallback = jasmine.createSpy('countUpdated')

	readonly counter = new CounterPart(this)
	readonly first = new LabelPart(this, 'first')
	readonly second = new LabelPart(this, 'second')

	protected override get template() {
		return html`
			<span id='total'>${this.total}</span>
			${this.counter.template}
			${this.first.template}
			${this.second.template}
		`
	}
}

describe('ComponentPart', () => {
	const fixture = new ComponentTestFixture(() => new ComponentPartTestComponent())

	const text = (selector: string) => fixture.component.renderRoot.querySelector(selector)?.textContent?.trim()

	it('should render the templates of its parts into the host', () => {
		expect(text('#total')).toBe('0')
		expect(text('#count')).toBe('0')
		expect(fixture.component.renderRoot.querySelectorAll('.label').length).toBe(2)
	})

	it('should initialize state through field initializers', () => {
		expect(fixture.component.counter.count).toBe(0)
		expect(fixture.component.counter.tracked).toBe('a')
		expect(fixture.component.first.visible).toBeFalse()
	})

	it('should resolve the host', () => {
		expect(fixture.component.counter[host]).toBe(fixture.component)
	})

	it('should re-render the host when the state of a part changes', async () => {
		fixture.component.counter.count = 5
		await fixture.updateComplete

		expect(text('#count')).toBe('5')
	})

	it('should not request an update when the state of a part does not change', () => {
		const requestUpdate = spyOn(fixture.component, 'requestUpdate').and.callThrough()

		fixture.component.counter.count = fixture.component.counter.count

		expect(requestUpdate).not.toHaveBeenCalled()
	})

	it('should keep the state of multiple instances of the same part isolated', async () => {
		fixture.component.first.visible = true
		await fixture.updateComplete

		expect(fixture.component.first.visible).toBeTrue()
		expect(fixture.component.second.visible).toBeFalse()
		expect([...fixture.component.renderRoot.querySelectorAll('.label')].map(e => e.textContent)).toEqual(['first', ''])
	})

	it('should not track the state of a part by a key of the host', async () => {
		fixture.component.countUpdatedCallback.calls.reset()

		fixture.component.counter.count = 42
		await fixture.updateComplete

		expect(fixture.component.count).toBe(100)
		expect(fixture.component.countUpdatedCallback).not.toHaveBeenCalled()
	})

	it('should support the updated callback bound to the part', async () => {
		const part = fixture.component.counter
		expect(part.trackedUpdatedCallback).toHaveBeenCalledOnceWith(part, 'a', undefined)

		part.tracked = 'b'
		await fixture.updateComplete

		expect(part.trackedUpdatedCallback).toHaveBeenCalledTimes(2)
		expect(part.trackedUpdatedCallback).toHaveBeenCalledWith(part, 'b', 'a')
	})

	it('should support queries resolving from the render root of the host', () => {
		expect(fixture.component.counter.countElement).toBe(fixture.component.renderRoot.querySelector('#count') as HTMLSpanElement)
		expect(fixture.component.counter.itemElements.length).toBe(2)
	})

	it('should support event listeners attached to the host', () => {
		fixture.component.dispatchEvent(new PointerEvent('click'))

		expect(fixture.component.counter.clickCallback).toHaveBeenCalledTimes(1)
	})

	it('should support events dispatched from the host', () => {
		const handler = jasmine.createSpy('countChange')
		fixture.component.addEventListener('countChange', (e: Event) => handler((e as CustomEvent<number>).detail))

		fixture.component.counter.increment()

		expect(handler).toHaveBeenCalledOnceWith(fixture.component.counter.count)
	})

	it('should let a part read and write the state of its host', async () => {
		const total = fixture.component.total
		fixture.component.counter.increment()
		await fixture.updateComplete

		expect(fixture.component.total).toBe(total + 1)
		expect(text('#total')).toBe(String(total + 1))
	})

	it('should support bindings declared in the template of a part', async () => {
		const input = fixture.component.renderRoot.querySelector('#text') as HTMLInputElement
		input.value = 'bound'
		input.dispatchEvent(new Event('change'))
		await fixture.updateComplete

		expect(fixture.component.counter.text).toBe('bound')
	})
})