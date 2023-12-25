export class BidirectionalMap<K, V> implements Map<K, V> {
	private readonly map = new Map<K, V>()
	private readonly reverseMap = new Map<V, K>()

	readonly [Symbol.toStringTag] = 'BidirectionalMap'

	constructor(...[entries]: ConstructorParameters<typeof Map<K, V>>) {
		for (const [key, value] of entries || []) {
			this.set(key, value)
		}
	}

	forEach(...parameters: Parameters<Map<K, V>['forEach']>) {
		return this.map.forEach(...parameters)
	}

	get size() {
		return this.map.size
	}

	entries() {
		return this.map.entries()
	}

	keys() {
		return this.map.keys()
	}

	values() {
		return this.map.values()
	}

	[Symbol.iterator]() {
		return this.map[Symbol.iterator]()
	}

	has(key: K): boolean {
		return this.map.has(key)
	}

	hasValue(value: V): boolean {
		return this.reverseMap.has(value)
	}

	get(key: K): V | undefined {
		return this.map.get(key)
	}

	getKey(value: V): K | undefined {
		return this.reverseMap.get(value)
	}

	delete(key: K): boolean {
		return this.reverseMap.delete(this.get(key)!) && this.map.delete(key)
	}

	deleteValue(value: V): boolean {
		return this.map.delete(this.getKey(value)!) && this.reverseMap.delete(value)
	}

	set(key: K, value: V): this {
		this.deleteValue(this.get(key)!)
		this.map.set(key, value)
		this.reverseMap.set(value, key)
		if (this.map.size !== this.reverseMap.size) {
			throw new Error('BidirectionalMap: value is not unique')
		}
		return this
	}

	clear() {
		this.reverseMap.clear()
		this.map.clear()
	}
}

globalThis.BidirectionalMap = BidirectionalMap

declare global {
	// eslint-disable-next-line no-var
	var BidirectionalMap: typeof import('./BidirectionalMap.js').BidirectionalMap
	type BidirectionalMap<K, V> = import('./BidirectionalMap.js').BidirectionalMap<K, V>
}