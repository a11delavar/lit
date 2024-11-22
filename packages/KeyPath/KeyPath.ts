import '@a11d/is-writable'

export function getKeyPath<T>(keyPath: KeyPathOf<T>): KeyPathOf<T> {
	return keyPath
}

export function getValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath): KeyPathValueOf<T, KeyPath> {
	return !keyPath ? undefined : keyPath
		.split('.')
		.reduce((value: any, key) => value === undefined || value === null ? value : value[key], object)
}

export function setValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath, value: KeyPathValueOf<T, KeyPath>) {
	const keys = keyPath.split('.')
	const lastKey = keys[keys.length - 1] as keyof T
	const otherKeysButLast = keys.slice(0, keys.length - 1)
	const lastObject = getValueByKeyPath(object, otherKeysButLast.join('.') as KeyPath) ?? object as any
	if (Object.isWritable(lastObject, lastKey)) {
		lastObject[lastKey] = value
	}
}

export function isKeyPathWritable<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath): boolean {
	if (!keyPath) return false
	const keys = keyPath.split('.')
	const lastKey = keys[keys.length - 1] as keyof T
	const otherKeysButLast = keys.slice(0, keys.length - 1)
	const lastObject = getValueByKeyPath(object, otherKeysButLast.join('.') as KeyPath) ?? object as any
	return Object.isWritable(lastObject, lastKey)
}

// @ts-expect-error = TypeScript deconstructs the types if we get it's type
globalThis.getKeyPath = getKeyPath
globalThis.getValueByKeyPath = getValueByKeyPath
globalThis.setValueByKeyPath = setValueByKeyPath
globalThis.isKeyPathWritable = isKeyPathWritable

type DepthLevels = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
type DefaultDepth = 1
type ShouldBreak<Deep extends DepthLevels[number]> = [Deep] extends [never] ? true : false
type NextCycle<Deep extends DepthLevels[number]> = DepthLevels[Deep]

declare global {
	function getKeyPath<T>(keyPath: KeyPathOf<T>): KeyPathOf<T>
	function getValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath): KeyPathValueOf<T, KeyPath>
	function setValueByKeyPath<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath, value: KeyPathValueOf<T, KeyPath>): void
	function isKeyPathWritable<T, KeyPath extends KeyPathOf<T>>(object: T, keyPath: KeyPath): boolean

	type KeyPathOf<T, Depth extends DepthLevels[number] = DefaultDepth> =
		ShouldBreak<Depth> extends true ? never :
		object extends Required<T> ? string :
		T extends ReadonlyArray<any> ? Extract<keyof T, `${number}`> | SubKeyPathOf<T, Extract<keyof T, `${number}`>, Depth> :
		T extends object ? Extract<keyof T, string> | SubKeyPathOf<T, Extract<keyof T, string>, Depth> :
		never

	type KeyPathValueOf<T, KeyPath extends string = KeyPathOf<T>, Depth extends DepthLevels[number] = DefaultDepth> =
		ShouldBreak<Depth> extends true ? never :
		KeyPath extends keyof T ? T[KeyPath] :
		KeyPath extends `${infer K}.${infer R}` ? K extends keyof T ? KeyPathValueOf<T[K], R, Depth> : unknown :
		unknown
}

type SubKeyPathOf<T, K extends string, Depth extends DepthLevels[number]> = K extends keyof T ? `${K}.${KeyPathOf<T[K], NextCycle<Depth>>}` : never