import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, Controller } from '../index.js'
import { getChangedPropertyKey } from './getChangedPropertyKey.js'

@component('lit-test-changed-property-key')
class ChangedPropertyKeyTestComponent extends Component { }

class ChangedPropertyKeyTestController extends Controller {
	constructor(override readonly host: ChangedPropertyKeyTestComponent) {
		super(host)
	}
}

describe(getChangedPropertyKey.name, () => {
	const fixture = new ComponentTestFixture(() => new ChangedPropertyKeyTestComponent())

	it('should return the property key itself for a reactive element', () => {
		expect(getChangedPropertyKey(fixture.component, 'foo')).toBe('foo')
	})

	it('should return a unique key for any other context', () => {
		const controller = new ChangedPropertyKeyTestController(fixture.component)

		const key = getChangedPropertyKey(controller, 'foo')

		expect(key).not.toBe('foo')
		expect(typeof key).toBe('symbol')
	})

	it('should return the same key for the same context and property', () => {
		const controller = new ChangedPropertyKeyTestController(fixture.component)

		expect(getChangedPropertyKey(controller, 'foo')).toBe(getChangedPropertyKey(controller, 'foo'))
	})

	it('should return different keys for different properties of the same context', () => {
		const controller = new ChangedPropertyKeyTestController(fixture.component)

		expect(getChangedPropertyKey(controller, 'foo')).not.toBe(getChangedPropertyKey(controller, 'bar'))
	})

	it('should return different keys for the same property of different contexts', () => {
		const controller = new ChangedPropertyKeyTestController(fixture.component)
		const anotherController = new ChangedPropertyKeyTestController(fixture.component)

		expect(getChangedPropertyKey(controller, 'foo')).not.toBe(getChangedPropertyKey(anotherController, 'foo'))
	})
})