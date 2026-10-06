# `@a11d/constructor`

Global types for classes: `Constructor<T>` for a class whose instances are `T`, and `AbstractConstructor<T>` for an abstract one.

## Installation

```bash
npm install @a11d/constructor
```

```ts
import '@a11d/constructor'
```

## Usage

Importing the package once declares both types globally, so they need no import where they are used.

```ts
function create<T>(Class: Constructor<T>): T {
	return new Class()
}

function isInstance<T>(value: unknown, Class: AbstractConstructor<T>): value is T {
	return value instanceof Class
}
```

| Type | Definition |
| --- | --- |
| `Constructor<T>` | `new (...args: Array<any>) => T` |
| `AbstractConstructor<T>` | `abstract new (...args: Array<any>) => T`, which also accepts a class that cannot be constructed itself, for extending it or checking against it with `instanceof` |
