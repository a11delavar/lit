# `Component` class

The `Component` class is the base class for all components. In addition to [Lit's lifecycle](https://lit.dev/docs/components/lifecycle/) callbacks it also additionally supports:
- `template` getter to define the component's template.
- `initialized()` callback
- `connected()` callback
- `disconnected()` callback

```ts
import { component, Component, html, eventListener, property } from '@a11d/lit'

@component('lit-button')
class Button extends Component {
	@property({ type: Boolean }) hidden = false

	protected override initialized() {
		console.log('initialized')
	}

	protected override connected() {
		console.log('connected')
	}

	protected override disconnected() {
		console.log('disconnected')
	}

	protected override get template() {
		return this.hidden ? html.nothing : html`
			<button>
				<slot></slot>
			</button>
		`;
	}
}
```