export class Property<T> {
	static fromKeyPath<T>(context: any, keyPath: KeyPath.Of<T>): Property<T> {
		return new Property<T>({
			get: () => KeyPath.get(context, keyPath) as T,
			set: !KeyPath.isWritable(context, keyPath) ? undefined : value => KeyPath.set(context, keyPath, value as any),
		})
	}

	static fromPropertyKey<T>(content: any, propertyKey: string | symbol): Property<T> {
		return new Property<T>({
			get: () => content[propertyKey] as T,
			set: Object.isWritable(content, propertyKey) ? value => content[propertyKey] = value : undefined,
		})
	}

	constructor(init?: Partial<Property<T>>) {
		Object.assign(this, init)
	}

	get?: () => T

	set?: (value: T) => void

	get isWritable() {
		return typeof this.set === 'function'
	}
}