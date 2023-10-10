# `Component` class

The `Component` class is the base class for all components. In addition to [Lit's lifecycle](https://lit.dev/docs/components/lifecycle/) callbacks it also supports using `template` getter to define the component's template.

```ts
import { component, Component, html, eventListener, property } from '@a11d/lit'

@component('lit-event-listener')
class Button extends Component {
    @property({ type: Boolean }) hidden = false

    protected override get template() {
        return this.hidden ? html.nothing : html`
            <button>
                <slot></slot>
            </button>
        `;
    }
}
```