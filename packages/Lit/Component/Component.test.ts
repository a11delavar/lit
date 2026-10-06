import { html } from 'lit'
import { Component } from '../Component/index.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

class TestComponent extends Component {
	static template = html`<div></div>`
	override get template() { return TestComponent.template }
}
customElements.define('test-component', TestComponent)

describe('Controller', () => {
	const fixture = new ComponentTestFixture<TestComponent>('test-component')

	it('should tunnel firstUpdated to initialized', async () => {
		vi.spyOn(Component.prototype as any, 'initialized').mockImplementation(() => {})

		await fixture.initialize()

		expect((fixture.component as any).initialized).toHaveBeenCalledExactlyOnceWith()
	})

	it('should tunnel connectedCallback to connected', () => {
		vi.spyOn(fixture.component as any, 'connected').mockImplementation(() => {})

		fixture.component.connectedCallback()

		expect((fixture.component as any).connected).toHaveBeenCalledExactlyOnceWith()
	})

	it('should tunnel disconnectedCallback to disconnected', () => {
		vi.spyOn(fixture.component as any, 'disconnected').mockImplementation(() => {})

		fixture.component.disconnectedCallback()

		expect((fixture.component as any).disconnected).toHaveBeenCalledExactlyOnceWith()
	})

	it('should tunnel template to render()', () => {
		expect((fixture.component as any).render()).toBe(TestComponent.template)
	})
})
