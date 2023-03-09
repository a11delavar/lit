# `event` Decorator

The `event` decorator allows you to make a class field an event dispatcher. This is useful for dispatching custom events on your components.

```ts
import { component, Component, html, event } from '@a11d/lit'

@component('lit-event')
class Event extends Component {
    @event() readonly delete!: EventDispatcher<'single' | 'all'>

    get template() {
        return html`
            <button @click=${() => this.delete.dispatch('single')}>Delete Single</button>
            <button @click=${() => this.delete.dispatch('all')}>Delete All</button>
        `;
    }
}
```

The `event` decorator will convert the field into a getter that returns an instance of either `HTMLEventDispatcher<T>` or `PureEventDispatcher<T>` based on the context it's used in. Both of which implement the `EventDispatcher<T>` interface.

It also can accept an options object of type `EventInit` as its first argument. The following options are available:
- `bubbles` - A boolean value indicating whether the event bubbles. The default is false.
- `cancelable` - A boolean value indicating whether the event can be cancelled. The default is false.
- `composed` - A boolean value indicating whether the event will trigger listeners outside of a shadow root. The default is false.

```ts
import { component, Component, html, event } from '@a11d/lit'

@component('lit-event-bubbles')
class EventBubbles extends Component {
    @event({ bubbles: true, composed: true }) readonly delete!: EventDispatcher<'single' | 'all'>

    get template() {
        return html`
            <button @click=${() => this.delete.dispatch('single')}>Delete Single</button>
            <button @click=${() => this.delete.dispatch('all')}>Delete All</button>
        `;
    }
}
```