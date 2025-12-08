# `eventListener` Decorator

Declaratively register event listeners on methods. The decorator automatically handles listener registration and cleanup.

```ts
import { component, Component, html, eventListener } from '@a11d/lit'

@component('event-handler')
class EventHandler extends Component {
    @eventListener('delete')
    private handleDelete(e: CustomEvent<'single' | 'all'>) {
        // Listens to 'delete' events on the component itself
        console.log('Delete:', e.detail)
    }

    protected get template() {
        return html`
            <delete-button></delete-button>
            <delete-button></delete-button>
            <delete-button></delete-button>
        `
    }
}
```

## Options

Providing a string as the parameter adds an event listener to the component itself. For more control, pass an options object:

### `type: string`
The event type to listen for (custom or native events).

### `target: EventTarget | Function`
The target(s) to listen on. Can be:
- `EventTarget` - A specific element
- `Iterable<EventTarget>` - Multiple elements
- `() => EventTarget` - Function returning an element
- `() => Iterable<EventTarget>` - Function returning multiple elements
- `() => Promise<EventTarget>` - Async function returning an element
- `() => Promise<Iterable<EventTarget>>` - Async function returning multiple elements

Functions are called with the component instance as `this`.

### `options: AddEventListenerOptions`
Standard event listener options passed to `addEventListener()`.

## Advanced Usage

```ts
import { component, Component, html, eventListener } from '@a11d/lit'

@component('event-handler')
class EventHandler extends Component {
    @eventListener({
        type: 'delete',
        async target(this: EventHandler) {
            await this.updateComplete
            return this.renderRoot.querySelectorAll('delete-button')
        },
    })
    private handleDelete(e: CustomEvent<'single' | 'all'>) {
        // Only handles events from delete-button elements in this component
    }

    @eventListener({ type: 'keydown', target: document })
    private handleDocumentKeyDown(e: KeyboardEvent) {
        // Listen to document-level events
    }

    protected get template() {
        return html`
            <delete-button></delete-button>
            <delete-button></delete-button>
            <delete-button></delete-button>
        `
    }
}
```