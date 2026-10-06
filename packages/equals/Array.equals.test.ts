import './index.js'
import { equals } from './symbol.js'

describe('Array.prototype.equals', () => {
	const object1 = { key: 'value' }
	const object2 = { key: 'value' }

	it('should return true if the arrays are equal', () => {
		const set1 = [1, 2, object1]
		const set2 = [1, 2, object2]

		expect(set1[equals](set2)).toBe(true)
		expect(set2[equals](set1)).toBe(true)
	})

	it('should return false if the sets are not equal', () => {
		const set1 = [1, 2, object1]
		const set2 = [1, 3, object2]

		expect(set1[equals](set2)).toBe(false)
		expect(set2[equals](set1)).toBe(false)
	})

	it('should compare holes with the values at their index', () => {
		// eslint-disable-next-line no-sparse-arrays
		const sparse = [1, , 3]

		expect(sparse[equals]([1, 2, 3])).toBe(false)
		expect(sparse[equals]([1, undefined, 3])).toBe(true)
	})
})
