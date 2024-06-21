import { equals } from './symbol'

describe('Global "equals" method', () => {
	afterEach(() => {
		Object.equals = undefined!
		Object.prototype.equals = undefined!
		Array.prototype.equals = undefined!
		Set.prototype.equals = undefined!
		Map.prototype.equals = undefined!
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

		// If called directly, nothing changes as the method is available in both
		expect(a[equals](b)).toBe(true)

		// But if called through the global Object[equals] method,
		// which is also used in all other comparer methods,
		// the overridden method is in force
		expect(Object[equals](a, b)).toBe(false)
		expect(Object[equals](b, a)).toBe(true)
	})
})