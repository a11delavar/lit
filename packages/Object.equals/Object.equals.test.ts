describe('Object.prototype.equals', () => {
	it('should compare two objects', () => {
		const a = { a: 1, b: new Date, c: { d: 1 } }
		const b = { a: 1, b: new Date, c: { d: 1 } }
		const c = { a: 1, b: new Date, c: { d: 2 } }

		expect(a.equals(b)).toBe(true)
		expect(b.equals(a)).toBe(true)
		expect(a.equals(c)).toBe(false)
		expect(c.equals(a)).toBe(false)
		expect(b.equals(c)).toBe(false)
		expect(c.equals(b)).toBe(false)
	})
})