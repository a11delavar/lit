import './index.js'

describe('KeyPath', () => {
	let object: {
		a: number
		b: {
			c: number
			d: {
				e: number
			}
		}
	}
	beforeEach(() => {
		object = {
			a: 1,
			b: {
				c: 2,
				d: {
					e: 3
				}
			}
		}
	})

	describe('of', () => {
		it('should return the key path', () => {
			expect(KeyPath.of('a')).toBe('a')
			expect(KeyPath.of('a.b')).toBe('a.b')
			expect(KeyPath.of('a.b.c')).toBe('a.b.c')
		})
	})

	describe('get', () => {
		it('should return the value at the key path', () => {
			expect(KeyPath.get(object, 'a')).toBe(1)
			expect(KeyPath.get(object, 'b.c')).toBe(2)
			expect(KeyPath.get(object as any, 'b.d.e')).toBe(3)
		})

		it('should return undefined if the key path does not exist', () => {
			expect(KeyPath.get(object as any, 'a.b')).toBe(undefined)
			expect(KeyPath.get(object as any, 'b.c.d')).toBe(undefined)
			expect(KeyPath.get(object as any, 'b.d.e.f')).toBe(undefined)
		})

		it('should return undefined if the key path is empty', () => {
			expect(KeyPath.get(object as any, '')).toBe(undefined)
		})

		it('should return undefined if the object is null or undefined', () => {
			expect(KeyPath.get(undefined as any, 'a')).toBe(undefined)
			expect(KeyPath.get(null as any, 'a')).toBe(undefined)
		})
	})

	describe('set', () => {
		it('should set the value at the key path', () => {
			KeyPath.set(object, 'a', 4)
			expect(object.a).toBe(4)

			KeyPath.set(object, 'b.c', 5)
			expect(object.b.c).toBe(5)

			KeyPath.set(object as any, 'b.d.e', 6)
			expect(object.b.d.e).toBe(6)
		})

		it('should return undefined if the key path does not exist', () => {
			KeyPath.set(object as any, 'a.b', 4)
			expect((object as any).a.b).toBe(undefined)

			KeyPath.set(object as any, 'b.c.d', 5)
			expect((object as any).b.c.d).toBe(undefined)

			KeyPath.set(object as any, 'b.d.e.f', 6)
			expect((object as any).b.d.e.f).toBe(undefined)
		})
	})

	describe('isWritable', () => {
		it('should return true if the key path is writable', () => {
			expect(KeyPath.isWritable(object, 'a')).toBe(true)
			expect(KeyPath.isWritable(object, 'b.c')).toBe(true)
			expect(KeyPath.isWritable(object as any, 'b.d.e')).toBe(true)
		})

		it('should return false if the key path is not writable', () => {
			expect(KeyPath.isWritable(object, 'b')).toBe(true)
			expect(KeyPath.isWritable(object, 'b.d')).toBe(true)
			expect(KeyPath.isWritable(object as any, 'b.d.e.f')).toBe(false)
		})

		it('should return false if the key path does not exist', () => {
			expect(KeyPath.isWritable(object as any, 'a.b')).toBe(false)
			expect(KeyPath.isWritable(object as any, 'b.c.d')).toBe(false)
			expect(KeyPath.isWritable(object as any, 'b.d.e.f')).toBe(false)
		})

		it('should return false if the key path is empty', () => {
			expect(KeyPath.isWritable(object as any, '')).toBe(false)
		})

		it('should return false if the object is undefined', () => {
			expect(KeyPath.isWritable(undefined as any, 'a')).toBe(false)
		})

		it('should return false if the object is null', () => {
			expect(KeyPath.isWritable(null as any, 'a')).toBe(false)
		})
	})

	describe('entries', () => {
		it('should return the path to the key', () => {
			expect(KeyPath.entries(object, 'a')).toEqual([{ key: 'a', path: 'a', value: object.a }])
			expect(KeyPath.entries(object, 'b.c')).toEqual([{ key: 'b', path: 'b', value: object.b }, { key: 'c', path: 'b.c', value: object.b.c }])
			expect(KeyPath.entries(object as any, 'b.d.e')).toEqual([
				{ key: 'b', path: 'b', value: object.b },
				{ key: 'd', path: 'b.d', value: object.b.d },
				{ key: 'e', path: 'b.d.e', value: object.b.d.e }
			])
		})

		it('should return an empty array if the key-path or object is invalid', () => {
			expect(KeyPath.entries(undefined as any, 'a')).toEqual([])
			expect(KeyPath.entries(null as any, 'a')).toEqual([])
			expect(KeyPath.entries(object as any, '')).toEqual([])
		})
	})
})