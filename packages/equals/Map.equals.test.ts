import './index.js'
import { equals } from './symbol.js'

describe('Map.prototype[equals]', () => {
	it('should compare two maps', () => {
		const a = new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		])

		const b = new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		])

		expect(a[equals](b)).toBe(true)
	})

	it('should compare two maps with different sizes', () => {
		const a = new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		])

		const b = new Map([
			['a', 1],
			['b', 2],
		])

		expect(a[equals](b)).toBe(false)
	})

	it('should compare two maps with different values', () => {
		const a = new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		])

		const b = new Map([
			['a', 1],
			['b', 2],
			['c', 4],
		])

		expect(a[equals](b)).toBe(false)
	})

	it('should compare two maps with different keys', () => {
		const a = new Map([
			['a', 1],
			['b', 2],
			['c', 3],
		])

		const b = new Map([
			['a', 1],
			['b', 2],
			['d', 3],
		])

		expect(a[equals](b)).toBe(false)
	})
})