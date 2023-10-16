# `bind` Directive

The `bind` directive is used to setup a synchronization binding between a component property and a data source, by listening to the given or associated event.

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

If no explicit associated event can be found, the `bind` decorator tries to find the implicitly associated event:
- For properties named `value` the implicit event is `change`
- For all other properties the implicit event is the property name with the `Change` suffix

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

### Default Property

The default property of an element is can be declared using the `@bindingDefaultProperty()` decorator or by passing the `bindingDefault` property to the `@property()` decorator. Both examples below are equivalent:

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