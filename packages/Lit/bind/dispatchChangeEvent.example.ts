import { Component, html, state, property, event, bind } from '../index.js'

// Child component that accepts a value and emits change events
class MyChildComponent extends Component {
	@event() readonly change: EventDispatcher<string>
	@property({ type: String, bindingDefault: true }) value = ''

	override get template() {
		return html`
			<div>Child Value: ${this.value}</div>
		`
	}
}
customElements.define('my-child-component', MyChildComponent)

// Parent component that binds to child with automatic event dispatching
class MyParentComponent extends Component {
	@state() parentValue = 'Hello World'

	override get template() {
		return html`
			<div>
				<h3>Example: dispatchChangeEvent option</h3>
				<p>Parent Value: ${this.parentValue}</p>
				
				<!-- This binding will automatically dispatch the 'change' event on the child when parentValue changes -->
				<my-child-component 
					${bind(this, 'parentValue', { dispatchChangeEvent: true })}
					@change=${(e: CustomEvent<string>) => console.log('Change event received:', e.detail)}
				></my-child-component>
				
				<button @click=${() => this.parentValue = 'Updated Value'}>
					Update Parent Value
				</button>
			</div>
		`
	}
}
customElements.define('my-parent-component', MyParentComponent)

// Usage example:
// When you click the "Update Parent Value" button:
// 1. The parentValue property changes to 'Updated Value'
// 2. The bind directive updates the child's value property
// 3. The bind directive dispatches a 'change' event on the child element
// 4. The @change event listener logs the new value to the console
