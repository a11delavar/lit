# `Component` class

The `Component` class is the base class for all components.

In addition to [Lit's standard lifecycle](https://lit.dev/docs/components/lifecycle/), `Component` provides:
- `template` getter - Define the component's template
- `initialized()` - Called once after the component is constructed
- `connected()` - Called each time the component is connected to the DOM
- `disconnected()` - Called each time the component is disconnected from the DOM

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