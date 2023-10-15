import './index.js'

describe('KeyPath', () => {
	describe('getKeyPath', () => {
		it('should return the key path', () => {
			expect(getKeyPath('a')).toBe('a')
			expect(getKeyPath('a.b')).toBe('a.b')
			expect(getKeyPath('a.b.c')).toBe('a.b.c')
		})
	})

	describe('getValueByKeyPath', () => {
		it('should return the value at the key path', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(getValueByKeyPath(object, 'a')).toBe(1)
			expect(getValueByKeyPath(object, 'b.c')).toBe(2)
			expect(getValueByKeyPath(object as any, 'b.d.e')).toBe(3)
		})

		it('should return undefined if the key path does not exist', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(getValueByKeyPath(object as any, 'a.b')).toBe(undefined)
			expect(getValueByKeyPath(object as any, 'b.c.d')).toBe(undefined)
			expect(getValueByKeyPath(object as any, 'b.d.e.f')).toBe(undefined)
		})

		it('should return undefined if the key path is empty', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(getValueByKeyPath(object as any, '')).toBe(undefined)
		})

		it('should return undefined if the object is undefined', () => {
			expect(getValueByKeyPath(undefined as any, 'a')).toBe(undefined)
		})

		it('should return null if the object is null', () => {
			expect(getValueByKeyPath(null as any, 'a')).toBe(null)
		})
	})

	describe('setValueByKeyPath', () => {
		it('should set the value at the key path', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			setValueByKeyPath(object, 'a', 4)
			expect(object.a).toBe(4)

			setValueByKeyPath(object, 'b.c', 5)
			expect(object.b.c).toBe(5)

			setValueByKeyPath(object as any, 'b.d.e', 6)
			expect(object.b.d.e).toBe(6)
		})

		it('should return undefined if the key path does not exist', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			setValueByKeyPath(object as any, 'a.b', 4)
			expect((object as any).a.b).toBe(undefined)

			setValueByKeyPath(object as any, 'b.c.d', 5)
			expect((object as any).b.c.d).toBe(undefined)

			setValueByKeyPath(object as any, 'b.d.e.f', 6)
			expect((object as any).b.d.e.f).toBe(undefined)
		})
	})
})