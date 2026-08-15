import { ReactiveElement } from 'lit'

const changedPropertyKeys = Symbol('changedPropertyKeys')

/**
 * Resolves the key by which a change of the given context's property is tracked
 * in the `changedProperties` of its host.
 *
 * For a `ReactiveElement` this is the property key itself. For any other context, such as a
 * `Controller`, a unique symbol per context and property is used, as the property does not exist
 * on the host and a plain key could therefore collide with a property of the host itself.
 */
export const getChangedPropertyKey = (context: object, propertyKey: PropertyKey): PropertyKey => {
	if (context instanceof ReactiveElement) {
		return propertyKey
	}

	const keys = ((context as any)[changedPropertyKeys] ??= new Map<PropertyKey, PropertyKey>()) as Map<PropertyKey, PropertyKey>
	const key = keys.get(propertyKey) ?? Symbol(String(propertyKey))
	keys.set(propertyKey, key)
	return key
}