import './index.js'

describe('Object.equals', () => {
	it('should compare null and undefined', () => {
		expect(Object.equals(null, undefined)).toBe(false)
		expect(Object.equals(undefined, null)).toBe(false)
		expect(Object.equals(null, null)).toBe(true)
		expect(Object.equals(undefined, undefined)).toBe(true)
	})

	it('should compare two objects containing "valueOf()"', () => {
		const a = { valueOf: () => 1 }
		const b = { valueOf: () => 1 }
		const c = { valueOf: () => 2 }

		expect(Object.equals(a, b)).toBe(true)
		expect(Object.equals(b, a)).toBe(true)
		expect(Object.equals(5, 5)).toBe(true)

		expect(Object.equals(a, c)).toBe(false)
		expect(Object.equals(c, a)).toBe(false)
		expect(Object.equals(b, c)).toBe(false)
		expect(Object.equals(c, b)).toBe(false)
		expect(Object.equals(5, 6)).toBe(false)
		expect(Object.equals(6, 5)).toBe(false)
	})

	it('should compare two objects containing "equals(other)"', () => {
		const a = { equals: (other: unknown) => !!other || true }
		const b = { equals: (other: unknown) => !!other || true }
		const c = { equals: (other: unknown) => !!other && false }

		expect(Object.equals(a, b)).toBe(true)
		expect(Object.equals(b, a)).toBe(true)
		expect(Object.equals(undefined, b)).toBe(true)
		expect(Object.equals(a, undefined)).toBe(true)

		expect(Object.equals(a, c)).toBe(true)
		expect(Object.equals(c, a)).toBe(false)
		expect(Object.equals(b, c)).toBe(true)
		expect(Object.equals(c, b)).toBe(false)
	})
})