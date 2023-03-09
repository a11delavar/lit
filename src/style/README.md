# [`style` Directive](./src/style/README.md)

The `style` directive allows you to define styles for the underlying element.

```ts
import { component, Component, html, style } from '@a11d/lit'

@component('lit-style')
class Style extends Component {
    get template() {
        return html`
            <div ${style({ color: 'red' })}>Hello World</div>
        `;
    }
}
```