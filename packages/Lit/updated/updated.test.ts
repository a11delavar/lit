import { ComponentTestFixture } from '@a11d/lit-testing'
import { property } from '../property.js'
import { component, Component } from '../Component/index.js'
import { updated as Updated } from './updated.js'

describe(Updated.name, () => {
	@component('lit-test-updated')
	class TestComponent extends Component {
		readonly callback = jasmine.createSpy()

		@property() noObserver?: string

		@property()
		@Updated(updated) primitive?: string

		@property({ type: Object, updated }) complex?: Date

		@property({
			type: Object,
			updated,
			hasChanged: (value: Date, oldValue: Date | undefined) => value.getTime() !== oldValue?.getTime(),
		}) complexWithComparer?: Date

		@property({ type: Object, updated }) internalChange?: { foo: string }
	}

	function updated(this: TestComponent, value: unknown, oldValue: unknown) {
		this.callback(this, value, oldValue)
	}

	const fixture = new ComponentTestFixture(() => new TestComponent())

	it('should not call the callback when unrelated properties change', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()

		fixture.component.noObserver = 'foo'
		await fixture.updateComplete
		fixture.component.noObserver = 'bar'
		await fixture.updateComplete

		expect(fixture.component.callback).not.toHaveBeenCalled()
	})


	it('should call the callback when the primitive property changes', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()

		fixture.component.primitive = 'bar'
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledOnceWith(fixture.component, 'bar', undefined)

		fixture.component.primitive = 'baz'
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
		expect(fixture.component.callback).toHaveBeenCalledWith(fixture.component, 'baz', 'bar')
	})

	it('should call the callback when a complex property changes', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()

		fixture.component.complex = new Date('2020-01-01')
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledOnceWith(fixture.component, new Date('2020-01-01'), undefined)

		fixture.component.complex = new Date('2020-01-02')
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
		expect(fixture.component.callback).toHaveBeenCalledWith(fixture.component, new Date('2020-01-02'), new Date('2020-01-01'))
	})

	it('should call the callback when a complex property with comparer changes', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()

		fixture.component.complexWithComparer = new Date('2020-01-01')
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledOnceWith(fixture.component, new Date('2020-01-01'), undefined)

		fixture.component.complexWithComparer = new Date('2020-01-02')
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
		expect(fixture.component.callback).toHaveBeenCalledWith(fixture.component, new Date('2020-01-02'), new Date('2020-01-01'))

		fixture.component.complexWithComparer = new Date('2020-01-02')
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
	})

	it('should call the callback when a object is changed within and update is requested manually', async () => {
		expect(fixture.component.callback).not.toHaveBeenCalled()

		fixture.component.internalChange = { foo: 'bar' }
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledOnceWith(fixture.component, { foo: 'bar' }, undefined)

		fixture.component.internalChange.foo = 'baz'
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(1)

		fixture.component.requestUpdate('internalChange', { foo: 'bar' })
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
		expect(fixture.component.callback).toHaveBeenCalledWith(fixture.component, { foo: 'baz' }, { foo: 'bar' })

		fixture.component.requestUpdate()
		await fixture.updateComplete
		expect(fixture.component.callback).toHaveBeenCalledTimes(2)
	})
})