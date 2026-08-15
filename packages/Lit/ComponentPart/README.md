# `ComponentPart` class

A `ComponentPart` is a part of a component, extracted into a class of its own **without introducing a component boundary**.

A part contributes a `template` to its host and may declare its own state, queries, events and event listeners with the very same decorators a component uses. As a part shares the update lifecycle of its host, changing the state of a part re-renders the host as a whole — no properties have to be passed down and no updates have to be propagated by hand.

```ts
import { bind, Component, component, ComponentPart, html, state } from '@a11d/lit'

class SearchPart extends ComponentPart<PageProducts> {
	@state() query = ''

	override get template() {
		return html`
			<input ${bind(this, 'query')}>
			<span>${this.host.products.filter(p => p.name.includes(this.query)).length}</span>
		`
	}
}

@component('page-products')
class PageProducts extends Component {
	@state() products = new Array<Product>()

	readonly search = new SearchPart(this)

	protected override get template() {
		return html`${this.search.template}`
	}
}
```

## Import the host as a type

A part names its host as a type argument and must therefore **import it with `import type`**, so the import is erased and the two files do not form a cycle at runtime:

```ts
// SearchPart.ts
import type { PageProducts } from './PageProducts.js'

export class SearchPart extends ComponentPart<PageProducts> { }
```

```ts
// PageProducts.ts
import { SearchPart } from './SearchPart.js'

@component('page-products')
export class PageProducts extends Component {
	readonly search = new SearchPart(this)
}
```

## When to use a part

Use a **component** whenever the extracted unit is reusable on its own, and a **part** whenever a large component should merely be broken up into comprehensible units:

|                        | `Component`                                  | `ComponentPart`                              |
| ---------------------- | -------------------------------------------- | -------------------------------------------- |
| Reusable on its own    | yes                                           | no, it belongs to its host                    |
| Data flow              | properties in, events out                     | direct access to the host                     |
| Update propagation     | by the properties passed to it                | shared with the host                          |
| DOM                    | own shadow root                               | rendered into the host's shadow root          |
| Styling                | own styles                                    | the styles of the host                        |

## Decorators

The decorators of this library resolve the element owning the update lifecycle through the `host` symbol, and therefore behave identically on a component and on a part:

| Decorator        | Behavior on a part                                                                   |
| ---------------- | ------------------------------------------------------------------------------------ |
| `state`          | stored on the part, requests an update of the host whenever it changes                |
| `updated`        | invoked with the part as `this` after the host has updated                            |
| `query`          | queries the render root of the host                                                   |
| `queryAll`       | queries the render root of the host                                                   |
| `event`          | dispatches from the host element                                                      |
| `eventListener`  | listens on the host element, with the part as `this`                                  |
| `bind`           | `bind(this, 'property')` binds against the part                                       |

As the state of a part does not exist on its host, it cannot be registered as a reactive property of it. It is instead tracked in the host's `changedProperties` by a key unique to the part and the property, so that it can neither collide with a property of the host nor with one of another part.

```ts
class CounterPart extends ComponentPart<PageCounter> {
	@state({ updated(this: CounterPart, value: number) { this.host.notify(value) } }) count = 0

	@query('#count') private readonly countElement!: HTMLElement | undefined

	@event() readonly countChange!: EventDispatcher<number>

	@eventListener('click')
	protected handleClick() {
		this.count++
		this.countChange.dispatch(this.count)
	}

	override get template() {
		return html`<span id='count'>${this.count}</span>`
	}
}
```

## Lifecycle

A part is a `Controller`, so all reactive controller callbacks are available:

```ts
class DataPart extends ComponentPart<PageData> {
	@state() data?: Data

	override async hostConnected() {
		this.data = await fetchData()
	}
}
```
