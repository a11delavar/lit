# `bind` Directive

Two-way data binding for Lit components. The `bind` directive synchronizes a component property with a data source by listening to the associated event, eliminating the need to manually wire up property and event handlers.

```ts
// With bind directive
html`<input ${bind(this, 'value')} />`

// Without bind directive
html`<input .value=${this.value} @change=${(e: Event) => this.value = (e.target as HTMLInputElement).value} />`
```

## Modes

The `bind` directive supports 3 modes:
- `one-way`: The component property is updated when the data source changes. This is the default mode when the source is read-only.
- `two-way`: The component property is updated when the data source changes and the data source is updated when the component property changes. This is the default mode when the source and target are not read-only.
- `one-way-to-source`: The data source is updated when the component property changes. This is the default mode when the target is read-only.

## Associated Events

The `bind` directive finds the associated event of a given property using the following procedure:

### 1. Explicit Associated Event
If the property comes with an explicit associated event, it will be used. You can specify an explicit associated event by using either the `event` property of the `@property()` decorator or the `@associatedEvent()` decorator. Both examples below are equivalent:

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher
	@property({ type: String, event: 'change' }) value = ''

	@event() readonly selectionChange!: EventDispatcher
	@property({ type: Boolean, event: 'selectionChange' }) selected = false

	@event() readonly dateChange!: EventDispatcher
	@property({ type: Object, event: 'dateChange' }) date?: Date

	// ...
}
```

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher
	@associatedEvent('change')
	@property({ type: String }) value = ''

	@event() readonly selectionChange!: EventDispatcher
	@associatedEvent('selectionChange')
	@property({ type: Boolean }) selected = false

	@event() readonly dateChange!: EventDispatcher
	@associatedEvent('dateChange')
	@property({ type: Object }) date?: Date

	// ...
}
```

### 2. Implicit Associated Event

If no explicit associated event can be found, the `bind` decorator tries to find the implicitly associated event by looking for a declared `@event()` dispatcher:
- For properties named `value` the implicit event is the `change` dispatcher
- For all other properties the implicit event is the dispatcher named after the property with the `Change` suffix

In both cases it is the DOM event type of that dispatcher which is used, which - thanks to the `type` option of the `@event()` decorator - is not necessarily the key it is declared with:

```ts
@component('my-component')
class MyComponent extends Component {
	@event({ type: 'date-change' }) readonly dateChange!: EventDispatcher<Date>
	@property({ type: Object }) date?: Date // implicit event: 'date-change'
}
```

Therefore in the example above you can omit the explicit associations of `value` and `date` properties:

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher
	@property({ type: String }) value = '' // implicit event: 'change'

	@event() readonly selectionChange!: EventDispatcher
	@property({ type: Boolean, event: 'selectionChange' }) selected = false // Cannot implicitly associate "selected" and "selectionChange", therefore, explicit event associated: 'selectionChange'

	@event() readonly dateChange!: EventDispatcher
	@property({ type: Object }) date?: Date // implicit event: 'dateChange'

	// ...
}
```

### 3. Default Associated Event

If no explicit or implicit associated event can be found, the default associated event will be used. The default associated event is the `change` event.

This fallback only applies when an event is *listened* to, as a listener always has to be attached to some event. Whenever an event is *dispatched* - as with the `dispatchAssociatedEvent` option below - a property without an explicit or implicit association has no associated event at all, and nothing is dispatched. Falling back would otherwise dispatch a `change` event for every property which merely happens to have no association.


## Property Bindings

All 3 property bindings of Lit namely attribute binding, boolean attribute binding and property binding are supported by the `bind` directive:

```ts
@component('my-parent-component')
class MyParentComponent extends Component {
	@state() value = 'Hello World'
	@state() selected = false
	@state() endDate = new Date()

	override get template() {
		return html`
			<my-component
				value=${bind(this, 'value')}
				?selected=${bind(this, 'selected')}
				.date=${bind(this, 'date')}
			></my-component>
		`
	}
}
```

Without the `bind` directive, the above example would look like this:

```ts
@component('my-parent-component')
class MyParentComponent extends Component {
	@state() value = 'Hello World'
	@state() selected = false
	@state() endDate = new Date()

	override get template() {
		return html`
			<my-component
				.value=${this.value}
				@change=${(e: CustomEvent<string>) => this.value = e.detail}
				?selected=${this.selected}
				@selectionChange=${(e: CustomEvent<boolean>) => this.selected = e.detail}
				.date=${this.date}
				@dateChange=${(e: CustomEvent<Date>) => this.date = e.detail}
			></my-component>
		`
	}
}
```

## Element Bindings

The `bind` directive can also be used to bind an element to a property. This binds the data source to the "default property" of the given element and throws an Error if the element does not have a default property:

```ts
@component('my-parent-component')
class MyParentComponent extends Component {
	@state() value = 'Hello World'

	override get template() {
		return html`
			<my-component ${bind(this, 'value')}></my-component>
		`
	}
}
```

Without the `bind` directive, the above example would look like this:

```ts
@component('my-parent-component')
class MyParentComponent extends Component {
	@state() value = 'Hello World'

	override get template() {
		return html`
			<my-component
				value=${this.value}
				@change=${(e: CustomEvent<string>) => this.value = e.detail}
			></my-component>
		`
	}
}
```

### Server-Side Rendering

A server renders attribute, boolean attribute and property bindings with the source's value, but no element bindings, as Lit renders no element directives on a server. In the browser, an element binding runs while the parent hydrates, before the element does, so the element's first render has the value the server's did not. That is fine as long as the value changes only the element's attributes, which hydration writes; where it changes text or a template choice, bind the default property by name, which the server renders too:

```ts
html`<my-component .value=${bind(this, 'value')}></my-component>`
```

### Default Property

The default property of an element can be declared using the `@bindingDefaultProperty()` decorator or by passing the `bindingDefault` property to the `@property()` decorator. Both examples below are equivalent:

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher
	@bindingDefaultProperty()
	@property({ type: String }) value = ''

	@event() readonly selectionChange!: EventDispatcher
	@property({ type: Boolean, event: 'selectionChange' }) selected = false

	@event() readonly dateChange!: EventDispatcher
	@property({ type: Object }) date?: Date

	// ...
}
```

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher
	@property({ type: String, bindingDefault: true }) value = ''

	@event() readonly selectionChange!: EventDispatcher
	@property({ type: Boolean, event: 'selectionChange' }) selected = false

	@event() readonly dateChange!: EventDispatcher
	@property({ type: Object }) date?: Date

	// ...
}
```

## `sourceUpdate` and `sourceUpdated` lifecycle methods

The `sourceUpdate` and `sourceUpdated` can be used to get notified before and after the source is being updated as a result of a target change:

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher<string>
	@property({ type: String, event: 'change' }) value = ''

	protected get template() {
		return html`
			<input ${bind(this, 'value', { sourceUpdated: (value: string) => this.change.dispatch(value) })} />
		`
	}
}
```

## `dispatchAssociatedEvent` option

Components which are bindable themselves have to notify their own consumers whenever one of their bindable properties changes, which is what the `dispatchAssociatedEvent` option does. It dispatches the event associated with the bound property **on the source itself**, right after the source has been updated by the target:

```ts
@component('my-component')
class MyComponent extends Component {
	@event() readonly change!: EventDispatcher<string>
	@property({ type: String }) value = ''

	protected get template() {
		return html`
			<input ${bind(this, 'value', { dispatchAssociatedEvent: true })} />
		`
	}
}
```

Typing into the `input` now sets `value` **and** dispatches `change` on `my-component`, which is exactly what makes `my-component` bindable by its own consumers:

```ts
html`<my-component value=${bind(this, 'name')}></my-component>`
```

The option supersedes dispatching by hand through `sourceUpdated`, and does so more faithfully: the event is dispatched through the associated `EventDispatcher` whenever there is one, so the DOM event type and the `EventInit` declared via `@event()` - `bubbles` and `composed` among them - are honored.

A few things are worth knowing about:
- **Nothing is dispatched for a property without an associated event.** See [Default Associated Event](#3-default-associated-event).
- **The event carries the source, not the target value.** For a binding with a `keyPath` the event is the one associated with the *source property*, therefore it carries that property as a whole rather than the value the key-path was written to.
- **Feedback loops are broken.** A binding never re-enters itself, so a consumer which reacts to the dispatched event by touching the target again cannot drive the binding into infinite recursion.

# `Binder` Class

The `Binder` class facilitates the creation of `bind` directives with deep bindings. It is especially useful for components which have a few central properties which are used often in bindings:

```ts
type Data = {
	name: string
	active: boolean
}

class DataComponent extends Component {
	@property({ type: Array }) data!: Data

	protected readonly dataBinder = new Binder<Data>(this, 'data')

	get template() {
		const { bind } = this.dataBinder
		return html`
			<input ${bind('name')} />
			<input type='checkbox' ${bind('active')} />
		`
	}
}
```

# Binding Integrations

Sometimes, especially in larger applications, it is useful to have the ability to add behavior to the `bind` directive. For example automatically adding an `required` attribute to the underlying input elements, if you have a validation library behind the scenes and can extract related metadata from your data source. This can be achieved by registering a custom `BindingIntegration`:

```ts
@bindingIntegration()
export class RequiredBindingIntegration extends BindingIntegration {
	override bind({ element, source, keyPath }: ValueBinder<any>) {
		if (element instanceof HTMLInputElement) {
			const required = /* your logic using "source" and "keyPath" here */;
			element.required = required
		}
	}
}
```