# `style` Directive

Apply inline styles to elements with proper typing and reactivity.

```ts
import { component, Component, html, style, property } from '@a11d/lit'

@component('styled-element')
class StyledElement extends Component {
    @property({ type: String }) color = 'red'
    @property({ type: Number }) size = 16

    protected get template() {
        return html`
            <div ${style({
                color: this.color,
                fontSize: `${this.size}px`,
                fontWeight: 'bold'
            })}>
                Styled Text
            </div>
        `
    }
}
```