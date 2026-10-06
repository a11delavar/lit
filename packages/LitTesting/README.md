# `@a11d/lit-testing`

A test fixture for Lit components. It creates a component before each spec, attaches it to the document and waits for its first update, then removes it after the spec.

## Installation

```bash
npm install --save-dev @a11d/lit-testing
```

## Usage

The fixture registers its hooks through the global `beforeEach` and `afterEach` of the test framework, such as Vitest with `globals: true`, Jasmine or Mocha. Create it inside the `describe` block whose specs use it, so that every spec starts from a fresh component.

```ts
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, html, property } from '@a11d/lit'

@component('my-counter')
class Counter extends Component {
	@property({ type: Number }) count = 0

	protected override get template() {
		return html`<button @click=${() => this.count++}>${this.count}</button>`
	}
}

describe('Counter', () => {
	const fixture = new ComponentTestFixture<Counter>('my-counter')

	it('should count clicks', async () => {
		fixture.component.renderRoot.querySelector('button')!.click()
		await fixture.updateComplete
		expect(fixture.component.count).toBe(1)
	})
})
```

The component is created in one of three ways:

| Parameter | Creates the component |
| --- | --- |
| A tag name, `'my-counter'` | With `document.createElement` |
| A function, `() => new Counter()` | By calling it |
| A template, ``html`<my-counter count='3'></my-counter>` `` | By rendering it and taking its first element |

| Member | Description |
| --- | --- |
| `component` | The component of the running spec |
| `updateComplete` | The component's `updateComplete` |
| `requestUpdate()` | Requests an update of the component |
| `update()` | Requests an update of the component and waits for it to complete |
| `initialize()` | Replaces the component with a new one and waits for its first update |

<!-- exports -->
## Exports

| Name | Kind |
| --- | --- |
| `ComponentTestFixture` | class |
<!-- /exports -->
