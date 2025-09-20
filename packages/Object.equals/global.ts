import { equals } from './symbol.js'

Object.prototype.equals = Object.prototype[equals]
Function.prototype.equals = Function.prototype[equals]
Array.prototype.equals = Array.prototype[equals]
Set.prototype.equals = Set.prototype[equals]
Map.prototype.equals = Map.prototype[equals]
Object.equals = Object[equals]

declare global {
	interface ObjectConstructor {
		equals(...args: Parameters<ObjectConstructor[typeof equals]>): ReturnType<ObjectConstructor[typeof equals]>
	}

	interface Object {
		equals(...args: Parameters<Object[typeof equals]>): ReturnType<Object[typeof equals]>
	}

	interface Function {
		equals(...args: Parameters<Function[typeof equals]>): ReturnType<Function[typeof equals]>
	}

	interface Array<T> {
		equals(...args: Parameters<Array<T>[typeof equals]>): ReturnType<Array<T>[typeof equals]>
	}

	interface Set<T> {
		equals(...args: Parameters<Set<T>[typeof equals]>): ReturnType<Set<T>[typeof equals]>
	}

	interface Map<K, V> {
		equals(...args: Parameters<Map<K, V>[typeof equals]>): ReturnType<Map<K, V>[typeof equals]>
	}
}