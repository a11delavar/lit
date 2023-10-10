import { html, Component } from '@a11d/lit'
import { ComponentTestFixture } from './ComponentTestFixture.js'

class FixtureTestComponent extends Component {
	// @ts-expect-error requestUpdate does exist on this
	readonly requestUpdateSpy = spyOn(this, 'requestUpdate').and.callThrough()
	readonly updateCompleteSpy = spyOnProperty(this, 'updateComplete', 'get').and.callThrough()
}
customElements.define('fixture-test-component', FixtureTestComponent)

describe('ComponentTestFixture', () => {
	describe('element construction', () => {
		const tagNameFixture = new ComponentTestFixture<FixtureTestComponent>('fixture-test-component')
		const factoryFixture = new ComponentTestFixture(() => new FixtureTestComponent())
		const templateFixture = new ComponentTestFixture(html`<fixture-test-component></fixture-test-component>`)

		it('should support tag name', () => {
			expect(tagNameFixture.component).toBeInstanceOf(FixtureTestComponent)
		})

		it('should support factory', () => {
			expect(factoryFixture.component).toBeInstanceOf(FixtureTestComponent)
		})

		it('should support template', () => {
			expect(templateFixture.component).toBeInstanceOf(FixtureTestComponent)
		})
	})

	const fixture = new ComponentTestFixture<FixtureTestComponent>('fixture-test-component')

	it('should have been initialized', () => {
		expect(fixture.component).toBeInstanceOf(FixtureTestComponent)
		expect(fixture.component.isConnected).toBeTrue()
		expect(fixture.component.requestUpdateSpy).toHaveBeenCalledTimes(0)
		expect(fixture.component.updateCompleteSpy).toHaveBeenCalledTimes(1)
	})

	it('should call requestUpdate through', () => {
		fixture.requestUpdate()
		expect(fixture.component.requestUpdateSpy).toHaveBeenCalledTimes(1)
		expect(fixture.component.updateCompleteSpy).toHaveBeenCalledTimes(1)
	})

	it('should call updateComplete through', async () => {
		await fixture.updateComplete
		expect(fixture.component.requestUpdateSpy).toHaveBeenCalledTimes(0)
		expect(fixture.component.updateCompleteSpy).toHaveBeenCalledTimes(2)
	})

	it('.update() should call requestUpdate() and await the updateComplete promise', async () => {
		await fixture.update()
		expect(fixture.component.requestUpdateSpy).toHaveBeenCalledTimes(1)
		expect(fixture.component.updateCompleteSpy).toHaveBeenCalledTimes(2)
	})
})