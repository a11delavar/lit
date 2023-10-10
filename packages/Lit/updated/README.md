# `updated` Decorator (along with upgraded `state` and `property` decorators)

The `updated` decorator allows you to define a method on a reactive property that will be called after the component has been updated due to a change in the property. This is useful for dispatching events or performing other actions **after** the component has been updated.

```ts
import { component, Component, html, state, updated } from '@a11d/lit'

@component('lit-data')
class Data extends Component {
    @updated(async function(this: Data) {
        await this.fetch()
    })
    @state() code?: string

    private fetch() {
        if (this.code) {
            this.data = await fetch(`https://api.example.com/${this.code}`)
        }
    }

    get template() {
        return html`
            <input placeholder='code' .value=${this.count} @change=${(e: Event) => this.count = Number((e.target as HTMLInputElement).value)} />
            ${this.data.map(item => html`<div>${item}</div>`)}
        `;
    }
}
```

Additionally the `state` and `property` decorators have been upgraded to allow for an `updated` callback directly an a property. The below example is equivalent to the above example.

```ts
import { component, Component, html, state, updated } from '@a11d/lit'

@component('lit-data')
class Data extends Component {
    @state({
        async updated(this: Data) {
            await this.fetch()
        }
    }) code?: string

    private fetch() {
        if (this.code) {
            this.data = await fetch(`https://api.example.com/${this.code}`)
        }
    }

    get template() {
        return html`
            <input placeholder='code' .value=${this.count} @change=${(e: Event) => this.count = Number((e.target as HTMLInputElement).value)} />
            ${this.data.map(item => html`<div>${item}</div>`)}
        `;
    }
}
```