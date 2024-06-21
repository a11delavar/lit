import { equals } from './symbol.js'

Object.equals = Object[equals]
Object.prototype.equals = Object.prototype[equals]
Array.prototype.equals = Array.prototype[equals]
Set.prototype.equals = Set.prototype[equals]
Map.prototype.equals = Map.prototype[equals]

declare global {
	interface ObjectConstructor {
		equals(...args: Parameters<ObjectConstructor[typeof equals]>): ReturnType<ObjectConstructor[typeof equals]>
	}

	interface Object {
		equals(...args: Parameters<typeof Object.prototype[typeof equals]>): ReturnType<typeof Object.prototype[typeof equals]>
	}

	interface Array<T> {
		equals(...args: Parameters<typeof Array<T>[typeof equals]>): ReturnType<typeof Array<T>[typeof equals]>
	}

	interface Set<T> {
		equals(...args: Parameters<typeof Set<T>[typeof equals]>): ReturnType<typeof Set<T>[typeof equals]>
	}

	interface Map<K, V> {
		equals(...args: Parameters<typeof Map<K, V>[typeof equals]>): ReturnType<typeof Map<K, V>[typeof equals]>
	}
}