# `@a11d/bidirectional-map`

A Map implementation that maintains a bidirectional relationship between keys and values, allowing lookups in both directions.

```typescript
import '@a11d/bidirectional-map'

const map = new BidirectionalMap([
	['en', 'English'],
	['fr', 'French'],
])

map.get('en') // 'English'
map.getKey('English') // 'en'
```

## Installation

```bash
npm install @a11d/bidirectional-map
```

## API

Implements the standard `Map<K, V>` interface with additional methods:

<details>
<summary><code>getKey(value: V): K | undefined</code> — Get key by value (reverse lookup)</summary>

```typescript
const map = new BidirectionalMap([['en', 'English'], ['fr', 'French']])
map.getKey('English') // 'en'
map.getKey('Spanish') // undefined
```
</details>

<details>
<summary><code>hasValue(value: V): boolean</code> — Check if a value exists</summary>

```typescript
const map = new BidirectionalMap([['en', 'English']])
map.hasValue('English') // true
map.hasValue('French') // false
```
</details>

<details>
<summary><code>deleteValue(value: V): boolean</code> — Remove entry by value</summary>

```typescript
const map = new BidirectionalMap([['en', 'English']])
map.deleteValue('English') // true
map.has('en') // false
```
</details>

## Global Type

The package automatically registers itself globally, so TypeScript recognizes `BidirectionalMap` without explicit imports:

```typescript
// Type is available globally
const map: BidirectionalMap<string, number> = new BidirectionalMap()
```
