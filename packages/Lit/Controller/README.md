# `Controller` class

A base class for [reactive controllers](https://lit.dev/docs/composition/controllers/) which registers itself with its host, so implementations only define the callbacks they are interested in.

```ts
import { Controller } from '@a11d/lit'

export class IntervalController extends Controller {
	private timerId?: number

	override hostConnected() {
		this.timerId = window.setInterval(() => this.host.requestUpdate(), 1000)
	}

	override hostDisconnected() {
		window.clearInterval(this.timerId)
	}
}
```

> [!Warning]
> Construct controllers in field initializers, not lazily. `addController` invokes `hostConnected` synchronously when the host is already connected. As `Controller` registers itself in its base constructor, that call happens before a subclass has initialized its members.