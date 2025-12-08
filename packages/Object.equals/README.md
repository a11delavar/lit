# `@a11d/equals`

Value equality for JavaScript. Compares objects, arrays, maps, sets, and functions by structure instead of reference.

```typescript
import '@a11d/equals'
import { equals } from '@a11d/equals'

const obj1 = { a: 1, b: [1, 2, 3] }
const obj2 = { a: 1, b: [1, 2, 3] }

Object[equals](obj1, obj2) // true
obj1 === obj2 // false
```

## Installation

```bash
npm install @a11d/equals
```

## Usage

Two APIs available:

**Symbol-based** (recommended):
```typescript
import { equals } from '@a11d/equals'
obj[equals](other)
```

**Global methods** (for `.equals()` syntax or when the symbol conflicts with other libraries):
```typescript
import '@a11d/equals/global'
obj.equals(other)
```

## Built-in types

<details>
<summary><b>Objects</b> — Deep comparison of properties. Requires same constructor and all property values to be equal.</summary>

**Objects with `valueOf()`**

Compared by their primitive values:

```typescript
const a = { valueOf: () => 1 }
const b = { valueOf: () => 1 }

Object[equals](a, b) // true
```

**`undefined` vs absence**

Missing properties and `undefined` values are treated as equal, but `null` is different:

```typescript
const obj1 = { a: 1, b: undefined }
const obj2 = { a: 1 }
const obj3 = { a: 1, b: null }

Object[equals](obj1, obj2) // true
Object[equals](obj1, obj3) // false
```

**Prototype-less objects**

Objects created with `Object.create(null)` work fine:

```typescript
const a = Object.create(null)
a.prop = 'value'

const b = { prop: 'value' }

Object[equals](a, b) // true
```
</details>

<details>
<summary><b>Arrays</b> — Element-by-element comparison.</summary>

Nested structures are compared deeply:

```typescript
const arr1 = [1, 2, { key: 'value' }]
const arr2 = [1, 2, { key: 'value' }]

Object[equals](arr1, arr2) // true
```
</details>

<details>
<summary><b>Maps & Sets</b> — Entry/element comparison with deep equality.</summary>

Values and elements are compared deeply. Note that Map keys are compared by identity:

```typescript
const map1 = new Map([['a', { id: 1 }], ['b', { id: 2 }]])
const map2 = new Map([['a', { id: 1 }], ['b', { id: 2 }]])

const set1 = new Set([1, { key: 'value' }])
const set2 = new Set([1, { key: 'value' }])

Object[equals](map1, map2) // true
Object[equals](set1, set2) // true
```
</details>

<details>
<summary><b>Functions</b> — Functions with identical string representation are equal.</summary>

```typescript
const fn1 = () => 42
const fn2 = () => 42

Object[equals](fn1, fn2) // true
```

Note: This compares the `.toString()` output, so functions with the same code but different names or closures may differ.
</details>

## Custom equality

Implement the `equals` symbol (or `.equals()` method with global API):

```typescript
import { equals } from '@a11d/equals'

class Person {
	constructor(public name: string, public age: number) {}

	[equals](other: unknown): boolean {
		return other instanceof Person
			&& this.name === other.name
			&& this.age === other.age
	}
}
```

## Lit integration

Use `hasChanged` to trigger re-renders only on structural changes:

```typescript
import { hasChanged } from '@a11d/equals'

class MyComponent extends Component {
	@property({ type: Object, hasChanged })
	data = { name: 'John', items: [1, 2, 3] }
}
```

Without this, Lit re-renders whenever you assign a new object reference, even if the content is identical.