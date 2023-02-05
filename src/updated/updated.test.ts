import { ComponentTestFixture } from '../test/ComponentTestFixture.js'
import { property } from './property.js'
import { component, Component } from '../Component/index.js'
import { updated } from './updated.js'

describe(updated.name, () => {
	@component('lit-test-updated')
	class TestComponent extends Component {
		readonly callback = jasmine.createSpy()

		@property()
		@updated(function (this: TestComponent, value: string, oldValue: string) {
			this.callback(this, value, oldValue)
		}) foo?: string

		@property() bar?: string
	}

	const fixture = new ComponentTestFixture(() => new TestComponent())

	it('should call the callback when the property changes', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()
		fixture.component.foo = 'bar'
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledOnceWith(fixture.component, 'bar', undefined)
		fixture.component.foo = 'baz'
		fixture.component.bar = 'baz'
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledWith(fixture.component, 'baz', 'bar')
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
	})
})