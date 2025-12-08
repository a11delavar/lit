# `updated` Decorator

React to property changes with callbacks. The `updated` decorator allows you to define a callback that runs after the component updates due to a property change.

```ts
import { component, Component, css, html, property, updated } from '@a11d/lit'

@component('progress-bar')
class ProgressBar extends Component {
    @updated(function(this: ProgressBar) {
        this.style.setProperty('--_progress', `${this.value}%`)
    })
    @property({ type: Number }) value = 0

    static get styles() {
        return css`
            :host { display: block; width: 100%; height: 20px; background: #e0e0e0; }
            .bar { height: 100%; width: var(--_progress, 0%); background: #4caf50; }
        `
    }

    protected get template() {
        return html`<div class="bar"></div>`
    }
}
```

## Inline Syntax

The `state` and `property` decorators support an `updated` callback directly:

```ts
import { component, Component, css, html, property } from '@a11d/lit'

@component('progress-bar')
class ProgressBar extends Component {
    @property({
        type: Number,
        updated(this: ProgressBar) {
            this.style.setProperty('--_progress', `${this.value}%`)
        }
    }) value = 0

    static get styles() {
        return css`
            :host { display: block; width: 100%; height: 20px; background: #e0e0e0; }
            .bar { height: 100%; width: var(--_progress, 0%); background: #4caf50; }
        `
    }

    protected get template() {
        return html`<div class="bar"></div>`
    }
}
```