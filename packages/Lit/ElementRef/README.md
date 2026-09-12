# `ElementRef` / `ElementRefs` classes

The element — or the elements — a template designates, with whatever it declares about them. Code gets the elements it works with from the template instead of querying for them.

```ts
import { Component, component, ElementRef, html } from '@a11d/lit'

@component('my-page')
class MyPage extends Component {
	readonly dialog = new ElementRef<HTMLDialogElement>()

	protected override get template() {
		return html`
			<button @click=${() => this.dialog.value?.showModal()}>Open</button>
			<dialog ${this.dialog.ref()}>Hello</dialog>
		`
	}
}
```

## It is a lit `Ref`

Without options, `ElementRef` is lit's `createRef()`. It can be passed anywhere a `Ref` is expected, and lit's own `ref` directive fills it just as well — though that directive carries no options, so it leaves them empty.

```html
<dialog ${this.dialog.ref()}></dialog>
<dialog ${ref(this.dialog)}></dialog>
```

## `ElementRefs`

The same at the other cardinality, and where a template usually has something to say about each element. What it declares is read back through `get`, refreshed on every render.

```ts
@component('color-picker')
class ColorPicker extends Component {
	@property({ type: Array }) colors = ['red', 'green', 'blue']
	@state() selected?: string

	readonly swatches = new ElementRefs<HTMLElement, string>()

	@eventListener('click')
	protected handleClick(event: Event) {
		this.selected = this.swatches.get(event.target as HTMLElement)
	}

	protected override get template() {
		return html`
			${this.colors.map(color => html`<button ${this.swatches.ref(color)}>${color}</button>`)}
		`
	}
}
```

The element carries what it was rendered for, so resolving an event to a value is a lookup rather than a parse of the DOM.

| | `ElementRef` | `ElementRefs` |
| --- | --- | --- |
| The element(s) | `value` | iteration, `size`, `has` |
| What was declared | `options` | `get(element)` |
| Designate | `set(element, options)` | `set(element, options)` |
| Forget | `delete(element)` | `delete(element)` |
| In a template | `ref(options)` | `ref(options)` |

`ElementRef` takes the same second type argument, though a single element usually declares nothing.

Iteration is in the order the elements were **first** declared. Re-declaring one keeps its place, so a collection whose order can change should order itself by what it declared.

## Both doors are the same door

`set` and `delete` are the whole API, and the directive calls exactly those. Elements that no template can put a directive on are registered by hand, on equal footing.

```ts
@component('color-picker')
class ColorPicker extends Component {
	readonly swatches = new ElementRefs<HTMLElement, string>()

	protected override updated() {
		for (const child of this.children) {
			this.swatches.set(child as HTMLElement, child.textContent ?? '')
		}
	}
}
```

## Lifecycle

```ts
readonly swatches = new ElementRefs<HTMLElement, string>({
	updated: (element, color) => element.style.background = color,
	disconnected: element => element.style.background = '',
})
```

| | When |
| --- | --- |
| `updated(element, options)` | Every render of the element's part, every reconnect, every `set`. |
| `disconnected(element, options)` | Lit dropped or disconnected the part, or `delete` was called. |

`updated` runs during the host's render — the moment to stamp state onto the element, never a moment to request an update. `disconnected` is handed the options the element last had, so `updated` can be undone without keeping a copy.

## Replacing an element

Lit renders a replacing part before it clears the replaced one, so a reference never falls empty during a swap: the arriving element is designated first, and the departing one is already superseded.

> [!Note]
> Expose `ref` as it is — a stable field. Lit identifies a directive by its class, so wrapping it in a getter that builds something new per access tears the part down on every render.