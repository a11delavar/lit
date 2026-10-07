# `Component` class

The base class for components, extending `LitElement` with a `template` getter and additional lifecycle callbacks.

In addition to [Lit's standard lifecycle](https://lit.dev/docs/components/lifecycle/), `Component` provides:
- `template` getter - Define the component's template
- `initialized()` - Called once after the component is constructed
- `connected()` - Called each time the component is connected to the DOM
- `disconnected()` - Called each time the component is disconnected from the DOM
- `hydrating` getter - Whether the first render in the browser must reproduce the server's

```ts
import { component, Component, html, property } from '@a11d/lit'

@component('custom-button')
class CustomButton extends Component {
	@property({ type: Boolean }) disabled = false

	protected override initialized() {
		console.log('Component initialized')
	}

	protected override connected() {
		console.log('Component connected to DOM')
	}

	protected override disconnected() {
		console.log('Component disconnected from DOM')
	}

	protected override get template() {
		return html`
			<button ?disabled=${this.disabled}>
				<slot></slot>
			</button>
		`
	}
}
```

## Server-side rendering

A component rendered by [Lit SSR](https://lit.dev/docs/ssr/overview/) hydrates in the browser once `@lit-labs/ssr-client/lit-element-hydrate-support.js` is imported ahead of it. Hydration keeps the server's text and template choices, so the first render in the browser must give what the server gave, and the server saw no light DOM. `hydrating` is `true` during that render. Once it is done, the component updates once more, and every slot with content signals a `slotchange`, which the browser did not for server-rendered content. A template can therefore answer as the server did while hydrating and catch up right after:

```ts
protected override get template() {
	const panes = isServer || this.hydrating ? [] : [...this.children]
	return html`${panes.map(pane => html`<div part='pane'><slot name=${pane.slot}></slot></div>`)}`
}
```

Attributes need no such care: Lit's hydration alone would keep the server's value of an attribute the browser renders differently, and `Component` makes it write those. This applies to every Lit template on a page that hydrates, not only to components, as it changes how Lit's attribute parts record their first value, and to no page that does not.