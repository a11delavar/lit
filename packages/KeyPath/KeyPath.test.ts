import './index.js'

describe('KeyPath', () => {
	describe('get', () => {
		it('should return the key path', () => {
			expect(KeyPath.get('a')).toBe('a')
			expect(KeyPath.get('a.b')).toBe('a.b')
			expect(KeyPath.get('a.b.c')).toBe('a.b.c')
		})
	})

	describe('getValue', () => {
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

			expect(KeyPath.getValue(object, 'a')).toBe(1)
			expect(KeyPath.getValue(object, 'b.c')).toBe(2)
			expect(KeyPath.getValue(object as any, 'b.d.e')).toBe(3)
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

			expect(KeyPath.getValue(object as any, 'a.b')).toBe(undefined)
			expect(KeyPath.getValue(object as any, 'b.c.d')).toBe(undefined)
			expect(KeyPath.getValue(object as any, 'b.d.e.f')).toBe(undefined)
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

			expect(KeyPath.getValue(object as any, '')).toBe(undefined)
		})

		it('should return undefined if the object is undefined', () => {
			expect(KeyPath.getValue(undefined as any, 'a')).toBe(undefined)
		})

		it('should return null if the object is null', () => {
			expect(KeyPath.getValue(null as any, 'a')).toBe(null)
		})
	})

	describe('setValue', () => {
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

			KeyPath.setValue(object, 'a', 4)
			expect(object.a).toBe(4)

			KeyPath.setValue(object, 'b.c', 5)
			expect(object.b.c).toBe(5)

			KeyPath.setValue(object as any, 'b.d.e', 6)
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

			KeyPath.setValue(object as any, 'a.b', 4)
			expect((object as any).a.b).toBe(undefined)

			KeyPath.setValue(object as any, 'b.c.d', 5)
			expect((object as any).b.c.d).toBe(undefined)

			KeyPath.setValue(object as any, 'b.d.e.f', 6)
			expect((object as any).b.d.e.f).toBe(undefined)
		})
	})

	describe('KeyPath.isWritable', () => {
		it('should return true if the key path is writable', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(KeyPath.isWritable(object, 'a')).toBe(true)
			expect(KeyPath.isWritable(object, 'b.c')).toBe(true)
			expect(KeyPath.isWritable(object as any, 'b.d.e')).toBe(true)
		})

		it('should return false if the key path is not writable', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(KeyPath.isWritable(object, 'b')).toBe(true)
			expect(KeyPath.isWritable(object, 'b.d')).toBe(true)
			expect(KeyPath.isWritable(object as any, 'b.d.e.f')).toBe(false)
		})

		it('should return false if the key path does not exist', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(KeyPath.isWritable(object as any, 'a.b')).toBe(false)
			expect(KeyPath.isWritable(object as any, 'b.c.d')).toBe(false)
			expect(KeyPath.isWritable(object as any, 'b.d.e.f')).toBe(false)
		})

		it('should return false if the key path is empty', () => {
			const object = {
				a: 1,
				b: {
					c: 2,
					d: {
						e: 3
					}
				}
			}

			expect(KeyPath.isWritable(object as any, '')).toBe(false)
		})

		it('should return false if the object is undefined', () => {
			expect(KeyPath.isWritable(undefined as any, 'a')).toBe(false)
		})

		it('should return false if the object is null', () => {
			expect(KeyPath.isWritable(null as any, 'a')).toBe(false)
		})
	})
})