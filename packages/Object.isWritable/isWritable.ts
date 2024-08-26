type LooseKey<T> = keyof T | (string & {})

export function isWritable<T>(object: T, key: LooseKey<T>) {
	return !Object.isFrozen(object)
		&& getPropertyDescriptors(object, key).every(descriptor => !!descriptor.set || !!descriptor.writable)
}

function getPropertyDescriptors<T>(object: T, key: LooseKey<T>) {
	const all = [Object.getOwnPropertyDescriptor(object, key)]
	let currentPrototype = Object.getPrototypeOf(object)
	while (currentPrototype) {
		all.push(Object.getOwnPropertyDescriptor(currentPrototype, key))
		currentPrototype = Object.getPrototypeOf(currentPrototype)
	}
	return all.filter(Boolean) as Array<PropertyDescriptor>
}

Object.isWritable = isWritable

declare global {
	interface ObjectConstructor {
		isWritable<T>(object: T, key: LooseKey<T>): boolean
	}
}