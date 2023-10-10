# `eventListener` Decorator

The `eventListener` decorator allows you to make a method to be an event listener.

```ts
import { component, Component, html, eventListener } from '@a11d/lit'

@component('lit-event-listener')
class EventListener extends Component {
    @eventListener('delete')
    private handleClick(e: CustomEvent<'single' | 'all'>) {
        // This should have been (hopefully!) dispatched by the `lit-event-bubbles` component
    }

    get template() {
        return html`
            <lit-event-bubbles></lit-event-bubbles>
            <lit-event-bubbles></lit-event-bubbles>
            <lit-event-bubbles></lit-event-bubbles>
        `;
    }
}
```

Providing a shorthand parameter of type `string` will automatically add an event listener to the root component. This can be customized by providing an object with the following properties:

- `type` - The type of event to listen for. This can be a custom event or a native event.
- `target` - The target to listen to events on. This can be one of the following types:
    - `EventTarget`: The event listener will be added to this node.
    - `Iterable<EventTarget>`: The event listener will be added to each node in the list.
    - `() => EventTarget`: The event listener will be added to the node returned by the function. If a function is provided, it will be called with the component instance as its `this` context.
    - `() => Iterable<EventTarget>`: The event listener will be added to each node returned by the function. If a function is provided, it will be called with the component instance as its `this` context.
    - `() => Promise<EventTarget>`: The event listener will be added to the node resulted by awaiting the promise. If a function is provided, it will be called with the component instance as its `this` context.
    - `() => Promise<Iterable<EventTarget>>`: The event listener will be added to each node resulted by awaiting the promise. If a function is provided, it will be called with the component instance as its `this` context.
- `options` - An object of type `AddEventListenerOptions` that will be passed to the `addEventListener` method.

```ts
import { component, Component, html, eventListener } from '@a11d/lit'

@component('lit-event-listener')
class EventListener extends Component {
    @eventListener({
        type: 'delete',
        async target(this: EventListener) {
            await this.updateComplete
            return this.renderRoot.querySelectorAll('lit-event')
        },
    })
    private handleDelete(e: CustomEvent<'single' | 'all'>) {
        // Now we know for sure that this event was dispatched by a `lit-event` components belonging to this component
    }

    @eventListener({ type: 'keydown', target: document })
    private handleDocumentKeyDown(e: PointerEvent) {
        // Demonstration of listening to events on the document
    }

    get template() {
        return html`
            <lit-event></lit-event>
            <lit-event></lit-event>
            <lit-event></lit-event>
        `;
    }
}
```