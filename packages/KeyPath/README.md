# KeyPath

A set of type-safe utilities for working with objects and their properties with support for array members.

- `KeyPath.get` - A type-safe function to get a key-path.
- `KeyPath.getValue` - A function to extract the value by a given key-path.
- `KeyPath.setValue` - A function to set the value by a given key-path.

```ts
const customer = {
	name: 'John Doe',
	addresses: [
		{ street: '123 Main St', city: 'Anytown' },
		{ street: '456 Elm St', city: 'Anytown' },
	] as const,
}

const keyPath = KeyPath.get<typeof customer>('addresses.0.street') // 'addresses.0.street'
const value = KeyPath.getValue(customer, 'addresses.0.street') // '123 Main St'
KeyPath.setValue(customer, 'addresses.0.street', '180 Azadi St')
/*
{
	name: 'John Doe',
	addresses: [
		{ street: '180 Azadi St', city: 'Anytown' },
		{ street: '456 Elm St', city: 'Anytown' },
	] as const,
}
*/
```