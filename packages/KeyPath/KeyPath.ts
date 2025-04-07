import '@a11d/is-writable'

export class KeyPath {
	static of<T>(keyPath: KeyPath.Of<T>): KeyPath.Of<T> {
		return keyPath
	}

	static get<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): KeyPath.ValueOf<T, KeyPath> {
		return !keyPath ? undefined! : keyPath
			.split('.')
			.reduce((value: any, key) => value === undefined || value === null ? value : value[key], object)
	}

	static set<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath, value: KeyPath.ValueOf<T, KeyPath>) {
		const keys = keyPath.split('.')
		const lastKey = keys[keys.length - 1] as keyof T
		const otherKeysButLast = keys.slice(0, keys.length - 1)
		const lastObject = KeyPath.get(object, otherKeysButLast.join('.') as KeyPath) ?? object as any
		if (Object.isWritable(lastObject, lastKey)) {
			lastObject[lastKey] = value
		}
	}

	static isWritable<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): boolean {
		if (!keyPath) {
			return false
		}
		const keys = keyPath.split('.')
		const lastKey = keys[keys.length - 1] as keyof T
		const otherKeysButLast = keys.slice(0, keys.length - 1)
		const lastObject = KeyPath.get(object, otherKeysButLast.join('.') as KeyPath) ?? object as any
		return Object.isWritable(lastObject, lastKey)
	}
}

globalThis.KeyPath = KeyPath as any

type DepthLevels = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
type DefaultDepth = 1
type ShouldBreak<Deep extends DepthLevels[number]> = [Deep] extends [never] ? true : false
type NextCycle<Deep extends DepthLevels[number]> = DepthLevels[Deep]
type SubKeyPathOf<T, K extends string, Depth extends DepthLevels[number]> = K extends keyof T ? `${K}.${KeyPath.Of<T[K], NextCycle<Depth>>}` : never

declare global {
	namespace KeyPath {
		type Of<T, Depth extends DepthLevels[number] = DefaultDepth> =
			ShouldBreak<Depth> extends true ? never :
			object extends Required<T> ? string :
			T extends ReadonlyArray<any> ? Extract<keyof T, `${number}`> | Extract<keyof T, string> | SubKeyPathOf<T, Extract<keyof T, `${number}`>, Depth> :
			T extends object ? Extract<keyof T, string> | SubKeyPathOf<T, Extract<keyof T, string>, Depth> :
			never

		type ValueOf<T, KeyPath extends string = Of<T>, Depth extends DepthLevels[number] = DefaultDepth> =
			ShouldBreak<Depth> extends true ? never :
			KeyPath extends keyof T ? T[KeyPath] :
			KeyPath extends `${infer K}.${infer R}` ? K extends keyof T ? ValueOf<T[K], R, Depth> : unknown :
			unknown

		function of<T>(keyPath: KeyPath.Of<T>): KeyPath.Of<T>
		function get<T, KeyPath extends Of<T>>(object: T, keyPath: KeyPath): ValueOf<T, KeyPath>
		function set<T, KeyPath extends Of<T>>(object: T, keyPath: KeyPath, value: ValueOf<T, KeyPath>): void
		function isWritable<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): boolean
	}
}