# `@a11d/is-writable`

Check if an object property is writable, accounting for property descriptors, getters/setters, and the prototype chain.

```typescript
import '@a11d/is-writable'

const obj = { name: 'John' }
Object.defineProperty(obj, 'id', { value: 123, writable: false })

Object.isWritable(obj, 'name') // true
Object.isWritable(obj, 'id') // false
```

## Installation

```bash
npm install @a11d/is-writable
```

## API

<details>
<summary><code>Object.isWritable(object, key): boolean</code> — Check if a property can be written to</summary>

Returns `true` if the property is writable, `false` otherwise.

```typescript
const obj = {}
Object.defineProperty(obj, 'readonly', { value: 42, writable: false })

Object.isWritable(obj, 'readonly') // false
Object.isWritable(obj, 'newProp') // true (non-existent properties are writable)
```

Checks the entire prototype chain:

```typescript
class Base {
	get value() { return 1 }
}

class Child extends Base {}

Object.isWritable(new Child(), 'value') // false (getter-only in prototype)
```
</details>

## Behavior

<details>
<summary>Frozen objects</summary>

Returns `false` for all properties on frozen objects:

```typescript
const obj = { name: 'John' }
Object.freeze(obj)

Object.isWritable(obj, 'name') // false
Object.isWritable(obj, 'newProp') // false
```
</details>

<details>
<summary>Getters and setters</summary>

Getter-only properties are not writable:

```typescript
const obj = {
	get value() { return 42 }
}

Object.isWritable(obj, 'value') // false
```

Properties with both getter and setter are writable:

```typescript
const obj = {
	get value() { return this._value },
	set value(v) { this._value = v }
}

Object.isWritable(obj, 'value') // true
```

Setter-only properties are writable:

```typescript
const obj = {
	set value(v) { console.log(v) }
}

Object.isWritable(obj, 'value') // true
```
</details>

<details>
<summary>Non-existent properties</summary>

Properties that don't exist are considered writable (unless the object is frozen):

```typescript
const obj = {}
Object.isWritable(obj, 'newProp') // true
```
</details>

<details>
<summary>Prototype chain</summary>

Checks all descriptors in the prototype chain:

```typescript
class Base {
	get value() { return 1 }
}

class Child extends Base {
	get value() { return 2 }
	set value(v) { /* add setter alongside getter */ }
}

Object.isWritable(new Base(), 'value') // false (getter-only)
Object.isWritable(new Child(), 'value') // true (has both getter and setter)
```
</details>
