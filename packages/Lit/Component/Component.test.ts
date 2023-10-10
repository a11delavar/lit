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
		spyOn(Component.prototype as any, 'initialized')

		await fixture.initialize()

		expect((fixture.component as any).initialized).toHaveBeenCalledOnceWith()
	})

	it('should tunnel connectedCallback to connected', () => {
		spyOn(fixture.component as any, 'connected')

		fixture.component.connectedCallback()

		expect((fixture.component as any).connected).toHaveBeenCalledOnceWith()
	})

	it('should tunnel disconnectedCallback to disconnected', () => {
		spyOn(fixture.component as any, 'disconnected')

		fixture.component.disconnectedCallback()

		expect((fixture.component as any).disconnected).toHaveBeenCalledOnceWith()
	})

	it('should tunnel template to render()', () => {
		expect((fixture.component as any).render()).toBe(TestComponent.template)
	})
})