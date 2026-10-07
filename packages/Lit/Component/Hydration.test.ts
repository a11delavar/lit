import '@lit-labs/ssr-client/lit-element-hydrate-support.js'
import { digestForTemplateResult } from '@lit-labs/ssr-client'
import { Component, Controller, html, property } from '../index.js'

describe('Hydration', () => {
	const template = html`<slot></slot>`

	class TestHydrationComponent extends Component {
		readonly renders = new Array<boolean>()
		readonly hostUpdates = new Array<boolean>()
		readonly sizeUpdates = new Array<string>()

		@property({ updated(this: TestHydrationComponent, size: string) { this.sizeUpdates.push(size) } }) size = 'small'

		readonly controller = new class extends Controller {
			override hostUpdated() {
				(this.host as TestHydrationComponent).hostUpdates.push((this.host as TestHydrationComponent).hydrating)
			}
		}(this)

		protected override get template() {
			this.renders.push(this.hydrating)
			return template
		}
	}
	customElements.define('test-hydration-component', TestHydrationComponent)

	let container: HTMLDivElement

	beforeEach(() => {
		container = document.createElement('div')
		document.body.append(container)
	})

	afterEach(() => container.remove())

	const settle = async (element: TestHydrationComponent) => {
		await element.updateComplete
		await new Promise(resolve => setTimeout(resolve, 0))
		await element.updateComplete
	}

	/** Parsed where it cannot upgrade and given the server's shadow root, so that it upgrades with it attached, as a server-rendered component does. */
	const renderOnServer = () => {
		const element = Document.parseHTMLUnsafe('<test-hydration-component><span></span></test-hydration-component>').querySelector('test-hydration-component')!
		element.attachShadow({ mode: 'open' }).innerHTML = `<!--lit-part ${digestForTemplateResult(template)}--><slot></slot><!--/lit-part-->`
		container.append(element)
		return element as TestHydrationComponent
	}

	describe('when rendered in the browser', () => {
		it('should never be hydrating', async () => {
			const element = document.createElement('test-hydration-component') as TestHydrationComponent
			element.append(document.createElement('span'))
			container.append(element)
			await settle(element)

			expect(element.renders).toEqual([false])
			expect(element.hostUpdates).toEqual([false])
		})

		it('should run the updated hooks of properties, which Lit\'s hydration support must not bypass', async () => {
			const element = document.createElement('test-hydration-component') as TestHydrationComponent
			container.append(element)
			await settle(element)
			element.size = 'large'
			await settle(element)

			expect(element.sizeUpdates).toEqual(['small', 'large'])
		})
	})

	describe('when rendered on the server', () => {
		it('should be hydrating during the first render and update once more', async () => {
			const element = renderOnServer()
			await settle(element)

			expect(element.renders).toEqual([true, false])
			expect(element.shadowRoot!.querySelectorAll('slot').length).toBe(1)
		})

		it('should no longer be hydrating when its controllers learn of the first update', async () => {
			const element = renderOnServer()
			await settle(element)

			expect(element.hostUpdates).toEqual([false, false])
		})

		it('should signal the slotted content once hydrated', async () => {
			const element = renderOnServer()
			const slotchange = vi.fn()
			element.shadowRoot!.addEventListener('slotchange', slotchange)
			await settle(element)

			// The fixture's own slot assignment signals as well, trusted, unlike a server-rendered page's
			expect(slotchange.mock.calls.filter(([event]) => !(event as Event).isTrusted).length).toBe(1)
		})
	})
})
