import { equals } from './symbol'

describe('Object.prototype.equals', () => {
	it('should compare two objects', () => {
		const a = { a: 1, b: new Date, c: { d: 1 } }
		const b = { a: 1, b: new Date, c: { d: 1 } }
		const c = { a: 1, b: new Date, c: { d: 2 } }

		expect(a[equals](b)).toBe(true)
		expect(b[equals](a)).toBe(true)
		expect(a[equals](c)).toBe(false)
		expect(c[equals](a)).toBe(false)
		expect(b[equals](c)).toBe(false)
		expect(c[equals](b)).toBe(false)
	})

	it('should support objects created without proper prototype', () => {
		const objectWithoutPrototype = Object.create(null)
		objectWithoutPrototype.prop = 'value'

		const objectWithPrototype = { prop: 'value' }

		expect(objectWithPrototype[equals](objectWithoutPrototype)).toBe(true)
	})

	it('should consider absence and undefined as equal', () => {
		const obj1 = { a: 1, b: undefined, c: { d: 1 } }
		const obj2 = { a: 1, c: { d: 1, e: undefined } }
		const obj3 = { a: 1, c: { d: 1, e: null } }

		expect(obj1[equals](obj2)).toBe(true)
		expect(obj2[equals](obj1)).toBe(true)
		expect(obj2[equals](obj3)).toBe(false)
		expect(obj3[equals](obj2)).toBe(false)
	})
})