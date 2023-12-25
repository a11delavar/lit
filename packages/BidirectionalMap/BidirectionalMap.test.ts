import './index.js'

describe('BidirectionalMap', () => {
	const sampleMap = new BidirectionalMap<string, string>([
		['key1', 'value1'],
		['key2', 'value2'],
	])

	describe('constructor', () => {
		it('should create a map', () => {
			expect(sampleMap.get('key1')).toEqual('value1')
			expect(sampleMap.getKey('value1')).toEqual('key1')
			expect(sampleMap.get('key2')).toEqual('value2')
			expect(sampleMap.getKey('value2')).toEqual('key2')
		})
	})

	describe('Symbol.toStringTag', () => {
		it('should return correct tag', () => {
			expect(sampleMap[Symbol.toStringTag]).toEqual('BidirectionalMap')
			expect(sampleMap.toString()).toEqual('[object BidirectionalMap]')
		})
	})

	describe('keys', () => {
		it('should iterate over keys', () => {
			const keys = [...sampleMap.keys()]
			expect(keys).toEqual(['key1', 'key2'])
		})
	})

	describe('values', () => {
		it('should iterate over values', () => {
			const values = [...sampleMap.values()]
			expect(values).toEqual(['value1', 'value2'])
		})
	})

	describe('entries', () => {
		it('should iterate over key-value pairs', () => {
			const entries = [...sampleMap.entries()]
			expect(entries).toEqual([['key1', 'value1'], ['key2', 'value2']])
		})

		it('should iterate using Symbol.iterator', () => {
			const entries = [...sampleMap]
			expect(entries).toEqual([['key1', 'value1'], ['key2', 'value2']])
		})
	})

	describe('forEach', () => {
		it('should iterate over key-value pairs', () => {
			const entries = new Array<[string, string]>()
			sampleMap.forEach((value, key) => entries.push([key, value]))
			expect(entries).toEqual([['key1', 'value1'], ['key2', 'value2']])
		})
	})

	describe('set', () => {
		it('should add key-value pairs', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			expect(map.get('key1')).toEqual('value1')
			expect(map.getKey('value1')).toEqual('key1')
		})

		it('should update value for existing key', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			map.set('key1', 'value2')
			expect(map.get('key1')).toEqual('value2')
			expect(map.getKey('value1')).toBeUndefined()
			expect(map.getKey('value2')).toEqual('key1')
		})

		it('should throw error when value is not unique', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			expect(() => map.set('key2', 'value1')).toThrow()
		})
	})

	describe('delete', () => {
		it('should delete key-value pairs', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			map.delete('key1')
			expect(map.get('key1')).toBeUndefined()
			expect(map.getKey('value1')).toBeUndefined()
		})

		it('should return false when key does not exist', () => {
			const map = new BidirectionalMap<string, string>()
			expect(map.delete('key1')).toBeFalse()
		})
	})

	describe('deleteValue', () => {
		it('should delete value-key pairs', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			map.deleteValue('value1')
			expect(map.get('key1')).toBeUndefined()
			expect(map.getKey('value1')).toBeUndefined()
		})

		it('should return false when value does not exist', () => {
			const map = new BidirectionalMap<string, string>()
			expect(map.deleteValue('value1')).toBeFalse()
		})
	})

	describe('clear', () => {
		it('should clear the map', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			map.set('key2', 'value2')
			map.clear()
			expect(map.size).toEqual(0)
		})
	})

	describe('size', () => {
		it('should return correct size', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			map.set('key2', 'value2')
			expect(map.size).toEqual(2)
		})
	})

	describe('has', () => {
		it('should check if a key exists', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			expect(map.has('key1')).toBeTrue()
			expect(map.has('key2')).toBeFalse()
		})
	})

	describe('hasValue', () => {
		it('should check if a value exists', () => {
			const map = new BidirectionalMap<string, string>()
			map.set('key1', 'value1')
			expect(map.hasValue('value1')).toBeTrue()
			expect(map.hasValue('value2')).toBeFalse()
		})
	})
})