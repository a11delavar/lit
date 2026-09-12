import { ComponentTestFixture } from '@a11d/lit-testing'
import { cache, Component, component, html, render, repeat, state } from '../index.js'
import { ElementRefs } from './ElementRefs.js'

@component('element-refs-test-component')
class ElementRefsTestComponent extends Component {
	readonly updatedCalls = new Array<readonly [Element, number]>()
	readonly disconnectedCalls = new Array<readonly [Element, number]>()

	readonly items = new ElementRefs<HTMLElement, number>({
		updated: (element, options) => this.updatedCalls.push([element, options]),
		disconnected: (element, options) => this.disconnectedCalls.push([element, options]),
	})

	readonly others = new ElementRefs<HTMLElement, number>()

	@state() indices = [0, 1, 2]
	@state() offset = 0
	@state() movableElsewhere = false

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }
	get movable() { return this.renderRoot.querySelector<HTMLElement>('#movable')! }

	protected override get template() {
		return html`
			${repeat(this.indices, index => index, index => html`
				<div class='item' data-index=${index} ${this.items.ref(index + this.offset)}></div>
			`)}
			<span id='movable' ${(this.movableElsewhere ? this.others : this.items).ref(99)}></span>
		`
	}
}

@component('element-refs-cache-test-component')
class ElementRefsCacheTestComponent extends Component {
	readonly items = new ElementRefs<HTMLElement, number>()

	@state() swapped = false

	get cached() { return this.renderRoot.querySelector<HTMLElement>('.cached')! }

	protected override get template() {
		return html`${cache(this.swapped
			? html`<div class='elsewhere'></div>`
			: html`<div class='cached' ${this.items.ref(0)}></div>`)}`
	}
}

describe('ElementRefs', () => {
	const fixture = new ComponentTestFixture(() => new ElementRefsTestComponent())

	it('holds the elements its directive is rendered on, in the order they were declared', () => {
		expect([...fixture.component.items]).toEqual([...fixture.component.itemElements, fixture.component.movable])
	})

	it('answers what an element was declared with', () => {
		expect(fixture.component.itemElements.map(element => fixture.component.items.get(element))).toEqual([0, 1, 2])
		expect(fixture.component.items.get(fixture.component.movable)).toBe(99)
	})

	it('answers nothing for an element it does not hold', () => {
		expect(fixture.component.items.get(document.createElement('div'))).toBeUndefined()
		expect(fixture.component.items.has(document.createElement('div'))).toBeFalse()
	})

	it('reports its size', () => {
		expect(fixture.component.items.size).toBe(4)
	})

	it('refreshes the options on every render, keeping the element in place', async () => {
		const elements = fixture.component.itemElements
		fixture.component.offset = 10
		await fixture.updateComplete

		expect(elements.map(element => fixture.component.items.get(element))).toEqual([10, 11, 12])
		expect([...fixture.component.items]).toEqual([...elements, fixture.component.movable])
		expect(fixture.component.disconnectedCalls).toEqual([])
	})

	it('reports a re-render as an update, never as a removal', async () => {
		fixture.component.updatedCalls.length = 0
		await fixture.update()

		expect(fixture.component.updatedCalls.map(([, options]) => options)).toEqual([0, 1, 2, 99])
		expect(fixture.component.disconnectedCalls).toEqual([])
	})

	it('forgets an element lit no longer renders, reporting its last options', async () => {
		const dropped = fixture.component.itemElements[2]!
		fixture.component.indices = [0, 1]
		await fixture.updateComplete

		expect(fixture.component.items.has(dropped)).toBeFalse()
		expect(fixture.component.disconnectedCalls).toEqual([[dropped, 2]])
	})

	it('takes elements which are rendered later', async () => {
		fixture.component.indices = [0, 1, 2, 3]
		await fixture.updateComplete

		expect(fixture.component.items.size).toBe(5)
		expect(fixture.component.items.get(fixture.component.itemElements[3]!)).toBe(3)
	})

	it('leaves the reference it was declared on when its part is re-rendered with another', async () => {
		const movable = fixture.component.movable
		fixture.component.movableElsewhere = true
		await fixture.updateComplete

		expect(fixture.component.items.has(movable)).toBeFalse()
		expect(fixture.component.others.get(movable)).toBe(99)
		expect(fixture.component.disconnectedCalls).toEqual([[movable, 99]])
	})

	it('keeps two references apart', () => {
		expect([...fixture.component.others]).toEqual([])
		expect(fixture.component.others.has(fixture.component.itemElements[0]!)).toBeFalse()
	})

	it('memoises its directive, so a re-render never tears the part down', () => {
		expect(fixture.component.items.ref).toBe(fixture.component.items.ref)
	})

	it('designates elements by hand, and forgets them again', () => {
		const items = new ElementRefs<HTMLElement, number>()
		const element = document.createElement('div')

		items.set(element, 7)

		expect(items.get(element)).toBe(7)
		expect(items.delete(element)).toBeTrue()
		expect(items.delete(element)).toBeFalse()
		expect(items.size).toBe(0)
	})

	it('reports nothing when an element it does not hold is forgotten', () => {
		const disconnected = new Array<Element>()
		const items = new ElementRefs<HTMLElement, number>({ disconnected: element => disconnected.push(element) })

		expect(items.delete(document.createElement('div'))).toBeFalse()
		expect(disconnected).toEqual([])
	})

	it('restores its elements when their part reconnects', () => {
		const items = new ElementRefs<HTMLElement, number>()
		const container = document.createElement('div')
		document.body.append(container)
		try {
			const part = render(html`<div ${items.ref(5)}></div>`, container)
			const element = container.firstElementChild as HTMLElement
			expect([...items]).toEqual([element])

			part.setConnected(false)
			expect([...items]).toEqual([])

			part.setConnected(true)
			expect([...items]).toEqual([element])
			expect(items.get(element)).toBe(5)
		} finally {
			container.remove()
		}
	})

	it('refuses to be used anywhere but on an element', () => {
		const items = new ElementRefs<HTMLElement, number>()

		expect(() => render(html`<div>${items.ref(0)}</div>`, document.createElement('div')))
			.toThrowError('This directive can only be used on an element')
	})

	describe('within lit\'s cache', () => {
		const cacheFixture = new ComponentTestFixture(() => new ElementRefsCacheTestComponent())

		it('takes an element whose template lit puts aside and restores', async () => {
			const element = cacheFixture.component.cached
			expect([...cacheFixture.component.items]).toEqual([element])

			cacheFixture.component.swapped = true
			await cacheFixture.updateComplete
			expect([...cacheFixture.component.items]).toEqual([])

			cacheFixture.component.swapped = false
			await cacheFixture.updateComplete

			expect([...cacheFixture.component.items]).toEqual([element])
			expect(cacheFixture.component.items.get(element)).toBe(0)
		})
	})
})