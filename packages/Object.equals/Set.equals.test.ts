describe('Set.prototype.equals', () => {
	const object1 = { key: 'value' }
	const object2 = { key: 'value' }

	it('should return true if the sets are equal', () => {
		const set1 = new Set([1, 2, object1])
		const set2 = new Set([1, 2, object2])

		expect(set1.equals(set2)).toBe(true)
		expect(set2.equals(set1)).toBe(true)
	})

	it('should return false if the sets are not equal', () => {
		const set1 = new Set([1, 2, object1])
		const set2 = new Set([1, 3, object2])

		expect(set1.equals(set2)).toBe(false)
		expect(set2.equals(set1)).toBe(false)
	})
})