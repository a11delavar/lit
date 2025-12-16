# `event` Decorator

Create type-safe custom event dispatchers for your components. The `event` decorator converts a class field into an `EventDispatcher` that can dispatch custom events with typed payloads.

```ts
import { component, Component, html, event, EventDispatcher } from '@a11d/lit'

@component('delete-button')
class DeleteButton extends Component {
    @event() readonly delete!: EventDispatcher<'single' | 'all'>

    protected get template() {
        return html`
            <button @click=${() => this.delete.dispatch('single')}>Delete Single</button>
            <button @click=${() => this.delete.dispatch('all')}>Delete All</button>
        `
    }
}
```

The decorator converts the field into a getter that returns an instance of either `HTMLElementEventDispatcher<T>` or `PureEventDispatcher<T>` based on the context, both implementing the `EventDispatcher<T>` interface.

## Event Options

The decorator accepts an options object to configure event behavior:
- `bubbles` - Whether the event bubbles up the DOM tree (default: `false`)
- `cancelable` - Whether the event can be cancelled (default: `false`)
- `composed` - Whether the event triggers listeners outside of shadow DOM (default: `false`)
- `type` - Custom DOM event type name (default: property name)

```ts
import { component, Component, html, event, EventDispatcher } from '@a11d/lit'

@component('delete-button')
class DeleteButton extends Component {
    @event({ bubbles: true, composed: true }) readonly delete!: EventDispatcher<'single' | 'all'>

    protected get template() {
        return html`
            <button @click=${() => this.delete.dispatch('single')}>Delete Single</button>
            <button @click=${() => this.delete.dispatch('all')}>Delete All</button>
        `
    }
}
```

### Custom Event Types

By default, the DOM event type matches the property name. Use the `type` option to specify a custom event type:

```ts
@component('user-form')
class UserForm extends Component {
    @event({ type: 'user-save', bubbles: true }) readonly save!: EventDispatcher<User>
    @event({ type: 'user-cancel' }) readonly cancel!: EventDispatcher<void>

    protected get template() {
        return html`
            <button @click=${() => this.save.dispatch(user)}>Save</button>
            <button @click=${() => this.cancel.dispatch()}>Cancel</button>
        `
    }
}

// Listen using the custom type
html`<user-form @user-save=${(e: CustomEvent<User>) => this.handleUserSave(e.detail)}></user-form>`
```