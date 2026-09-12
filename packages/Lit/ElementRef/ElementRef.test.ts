import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, html, ref, render, state } from '../index.js'
import { ElementRef } from './ElementRef.js'

@component('element-ref-test-component')
class ElementRefTestComponent extends Component {
	readonly updatedCalls = new Array<readonly [Element, string]>()
	readonly disconnectedCalls = new Array<readonly [Element, string]>()

	readonly target = new ElementRef<HTMLElement, string>({
		updated: (element, options) => this.updatedCalls.push([element, options]),
		disconnected: (element, options) => this.disconnectedCalls.push([element, options]),
	})

	@state() declared = 'a'
	@state() rendered = true
	@state() swapped = false

	get first() { return this.renderRoot.querySelector<HTMLElement>('#first') }
	get second() { return this.renderRoot.querySelector<HTMLElement>('#second') }

	protected override get template() {
		return !this.rendered ? html.nothing : this.swapped
			? html`<span id='second' ${this.target.ref(this.declared)}></span>`
			: html`<div id='first' ${this.target.ref(this.declared)}></div>`
	}
}

@component('element-ref-move-test-component')
class ElementRefMoveTestComponent extends Component {
	readonly from = new ElementRef<HTMLElement>()
	readonly to = new ElementRef<HTMLElement>()

	@state() moved = false

	get element() { return this.renderRoot.querySelector<HTMLElement>('div')! }

	protected override get template() {
		return html`<div ${(this.moved ? this.to : this.from).ref()}></div>`
	}
}

@component('element-ref-lit-test-component')
class ElementRefLitTestComponent extends Component {
	readonly disconnectedCalls = new Array<Element>()

	readonly target = new ElementRef<HTMLElement>({
		disconnected: element => this.disconnectedCalls.push(element),
	})

	@state() rendered = true

	protected override get template() {
		return !this.rendered ? html.nothing : html`<div id='lit' ${ref(this.target)}></div>`
	}
}

describe('ElementRef', () => {
	const fixture = new ComponentTestFixture(() => new ElementRefTestComponent())

	const tracked = () => {
		const updated = new Array<readonly [Element, string | undefined]>()
		const disconnected = new Array<readonly [Element, string | undefined]>()
		const target = new ElementRef<HTMLElement, string>({
			updated: (element, options) => updated.push([element, options]),
			disconnected: (element, options) => disconnected.push([element, options]),
		})
		return { target, updated, disconnected }
	}

	it('holds the element its directive is rendered on', () => {
		expect(fixture.component.target.value).toBe(fixture.component.first!)
	})

	it('holds the options the element was declared with', () => {
		expect(fixture.component.target.options).toBe('a')
	})

	it('refreshes the options on every render, without ever letting the element go', async () => {
		fixture.component.declared = 'b'
		await fixture.updateComplete

		expect(fixture.component.target.options).toBe('b')
		expect(fixture.component.target.value).toBe(fixture.component.first!)
		expect(fixture.component.disconnectedCalls).toEqual([])
	})

	it('reports every render as an update', async () => {
		const element = fixture.component.first!
		expect(fixture.component.updatedCalls).toEqual([[element, 'a']])

		await fixture.update()

		expect(fixture.component.updatedCalls).toEqual([[element, 'a'], [element, 'a']])
	})

	it('forgets the element when lit drops it, reporting the options it last had', async () => {
		const element = fixture.component.first!
		fixture.component.rendered = false
		await fixture.updateComplete

		expect(fixture.component.target.value).toBeUndefined()
		expect(fixture.component.target.options).toBeUndefined()
		expect(fixture.component.disconnectedCalls).toEqual([[element, 'a']])
	})

	// Lit renders a replacing part before it clears the replaced one, so the arriving element is
	// designated first and the departing one then finds itself already superseded.
	it('takes the element of a part which replaces another, and is not emptied by the one it replaced', async () => {
		const replaced = fixture.component.first!
		fixture.component.swapped = true
		await fixture.updateComplete

		expect(fixture.component.target.value).toBe(fixture.component.second!)
		expect(fixture.component.disconnectedCalls).toEqual([[replaced, 'a']])
	})

	it('designates an element by hand, and forgets it again', () => {
		const target = new ElementRef<HTMLElement, string>()
		const element = document.createElement('div')

		target.set(element, 'x')

		expect(target.value).toBe(element)
		expect(target.options).toBe('x')
		expect(target.delete(element)).toBeTrue()
		expect(target.value).toBeUndefined()
	})

	it('refuses to forget an element it does not hold, reporting nothing', () => {
		const { target, disconnected } = tracked()
		const element = document.createElement('div')
		target.set(element, 'x')

		expect(target.delete(document.createElement('div'))).toBeFalse()
		expect(target.value).toBe(element)
		expect(disconnected).toEqual([])
	})

	it('designates an element when `value` is assigned, carrying no options', () => {
		const { target, updated } = tracked()
		const element = document.createElement('div')

		target.value = element

		expect(target.value).toBe(element)
		expect(target.options).toBeUndefined()
		expect(updated).toEqual([[element, undefined]])
	})

	it('forgets the element it holds when given nothing', () => {
		const { target, disconnected } = tracked()
		const element = document.createElement('div')
		target.set(element, 'x')

		target.value = undefined

		expect(target.value).toBeUndefined()
		expect(target.options).toBeUndefined()
		expect(disconnected).toEqual([[element, 'x']])
	})

	it('does nothing when it is emptied while already empty', () => {
		const { target, updated, disconnected } = tracked()

		target.value = undefined

		expect(target.value).toBeUndefined()
		expect(updated).toEqual([])
		expect(disconnected).toEqual([])
	})

	it('reports a re-declaration of the element it already holds as an update, never as a removal', () => {
		const { target, updated, disconnected } = tracked()
		const element = document.createElement('div')

		target.set(element, 'x')
		target.set(element, 'y')

		expect(target.options).toBe('y')
		expect(updated).toEqual([[element, 'x'], [element, 'y']])
		expect(disconnected).toEqual([])
	})

	it('restores the element when its part reconnects', () => {
		const target = new ElementRef<HTMLElement, string>()
		const container = document.createElement('div')
		document.body.append(container)
		try {
			const part = render(html`<div ${target.ref('x')}></div>`, container)
			const element = container.firstElementChild as HTMLElement
			expect(target.value).toBe(element)

			part.setConnected(false)
			expect(target.value).toBeUndefined()

			part.setConnected(true)
			expect(target.value).toBe(element)
			expect(target.options).toBe('x')
		} finally {
			container.remove()
		}
	})

	it('refuses to be used anywhere but on an element', () => {
		const target = new ElementRef<HTMLElement, string>()

		expect(() => render(html`<div>${target.ref('x')}</div>`, document.createElement('div')))
			.toThrowError('This directive can only be used on an element')
	})

	describe('when its part is re-rendered with another reference', () => {
		const moveFixture = new ComponentTestFixture(() => new ElementRefMoveTestComponent())

		it('leaves the one it was declared on', async () => {
			const element = moveFixture.component.element
			expect(moveFixture.component.from.value).toBe(element)

			moveFixture.component.moved = true
			await moveFixture.updateComplete

			expect(moveFixture.component.from.value).toBeUndefined()
			expect(moveFixture.component.to.value).toBe(element)
		})
	})

	describe('as a lit `Ref`', () => {
		const litFixture = new ComponentTestFixture(() => new ElementRefLitTestComponent())

		it('is filled and emptied by lit\'s own `ref` directive', async () => {
			const element = litFixture.component.renderRoot.querySelector<HTMLElement>('#lit')!
			expect(litFixture.component.target.value).toBe(element)

			litFixture.component.rendered = false
			await litFixture.updateComplete

			expect(litFixture.component.target.value).toBeUndefined()
			expect(litFixture.component.disconnectedCalls).toEqual([element])
		})
	})
})