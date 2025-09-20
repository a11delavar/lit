import { equals } from './symbol'
import './equals.js'

describe('Global "equals" method', () => {
	afterEach(() => {
		Object.equals = undefined!
		Object.prototype.equals = undefined!
		Array.prototype.equals = undefined!
		Set.prototype.equals = undefined!
		Map.prototype.equals = undefined!
		Function.prototype.equals = undefined!
	})

	it('should compare two objects using "equals" method only when "global.js" is imported', async () => {
		const a: any = { a: 1, b: 2 }
		const b: any = { a: 1, b: 2 }

		expect(a[equals](b)).toBe(true)
		expect(Object[equals](a, b)).toBe(true)
		expect(a.equals?.(b)).toBe(undefined)
		expect(Object.equals?.(a, b)).toBe(undefined as any)

		await import('./global.js')

		expect(a[equals](b)).toBe(true)
		expect(a.equals(b)).toBe(true)
		expect(Object[equals](a, b)).toBe(true)
		expect(Object.equals(a, b)).toBe(true)

		a.equals = () => false
		b.equals = () => true

		// When calling Object.prototype[equals] it returns false
		// as the "equals" method are not equal.
		expect(a[equals](b)).toBe(false)

		// When calling the global Object[equals] method
		// the overridden "equals" method is in force.
		expect(Object[equals](a, b)).toBe(false)
		expect(Object[equals](b, a)).toBe(true)
	})
})