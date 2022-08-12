/* eslint-disable no-prototype-builtins */
import { LitElement } from 'lit'

type InheritanceHandler<T> = (own: T, inherited?: T) => T

const defaultInheritanceHandlersByType = new Map<Constructor<unknown>, InheritanceHandler<any>>([
	[Array, (own: Array<unknown>, inherited?: Array<unknown>) => [...(inherited ?? []), ...own]],
	[Set, (own: Set<unknown>, inherited?: Set<unknown>) => new Set([...(inherited ?? []), ...own])],
	[Map, (own: Map<unknown, unknown>, inherited?: Map<unknown, unknown>) => new Map([...(inherited ?? []), ...own]) ],
])

const defaultInheritanceHandler: InheritanceHandler<any> = (own, inherited) => inherited ? Object.assign(own, inherited) : own

function getDefaultInheritanceHandler<T>(value: T) {
	const type = 'constructor' in value ? (value as any).constructor : undefined
	return (defaultInheritanceHandlersByType.get(type) ?? defaultInheritanceHandler) as InheritanceHandler<T>
}

export const decorateLitElement = <T>({ constructorPropertyKey, prototype, initialValue, lifecycleHooks, inheritanceHandler }: {
	constructorPropertyKey: symbol | string
	prototype: LitElement
	initialValue: T
	inheritanceHandler?: InheritanceHandler<T>
	lifecycleHooks?: Map<string, (this: LitElement, data: T, ...args: Array<any>) => any>
}) => {
	const p = prototype as any
	const constructor = prototype.constructor as any
	const existingValue = Object.getOwnPropertyDescriptor(constructor, constructorPropertyKey)?.value as T | undefined

	if (existingValue) {
		return existingValue
	}

	const inherit = inheritanceHandler ?? getDefaultInheritanceHandler(initialValue)

	const inheritedValue = constructor[constructorPropertyKey]
	const value = inherit(initialValue, inheritedValue)
	Object.defineProperty(constructor, constructorPropertyKey, { value })

	for (const [lifecycleName, lifecycleFunction] of lifecycleHooks ?? []) {
		const originalFunction = p[lifecycleName]
		p[lifecycleName] = function (this: LitElement, ...args: Array<any>) {
			originalFunction.call(this, ...args)
			lifecycleFunction.call(this, value, ...args)
		}
	}

	return value
}