import '@a11d/is-writable'

export class KeyPath {
	static of<T>(keyPath: KeyPath.Of<T>): KeyPath.Of<T> {
		return keyPath
	}

	static get<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): KeyPath.ValueOf<T, KeyPath> {
		return KeyPath.entries(object, keyPath).at(-1)?.value
	}

	static set<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath, value: KeyPath.ValueOf<T, KeyPath>) {
		if (KeyPath.isWritable(object, keyPath)) {
			const entries = KeyPath.entries(object, keyPath);
			(entries.length <= 1 ? object : entries.at(-2)!.value)[entries.at(-1)!.key] = value
		}
	}

	static isWritable<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): boolean {
		const o = object as any
		if (!keyPath || o === null || o === undefined) {
			return false
		}
		const entries = KeyPath.entries(object, keyPath)
		return Object.isWritable(
			(entries.length <= 1 ? object : entries.at(-2)!.value),
			entries.at(-1)!.key
		)
	}

	static entries<T, K extends KeyPath.Of<T>>(object: T, keyPath: K): Array<KeyPath.Entry> {
		if (object === null || object === undefined || !keyPath) {
			return []
		}

		return keyPath.split('.').reduce((entries, key, index) => {
			const lastEntry = entries.at(-1)
			entries.push({
				key,
				path: [lastEntry?.path, key].filter(Boolean).join('.'),
				value: (index === 0 ? object : lastEntry?.value)?.[key]
			})
			return entries
		}, new Array<KeyPath.Entry>())
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

		type Entry = {
			readonly key: string
			readonly path: string
			readonly value: any
		}

		function of<T>(keyPath: KeyPath.Of<T>): KeyPath.Of<T>
		function get<T, KeyPath extends Of<T>>(object: T, keyPath: KeyPath): ValueOf<T, KeyPath>
		function set<T, KeyPath extends Of<T>>(object: T, keyPath: KeyPath, value: ValueOf<T, KeyPath>): void
		function isWritable<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): boolean
		function entries<T, KeyPath extends KeyPath.Of<T>>(object: T, keyPath: KeyPath): Array<KeyPath.Entry>
	}
}