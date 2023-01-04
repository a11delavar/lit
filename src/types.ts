declare global {
	export type AbstractConstructor<T> = abstract new (...args: Array<any>) => T
	export type Constructor<T> = new (...args: Array<any>) => T
}