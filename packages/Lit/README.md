# `@a11d/lit`

Enhanced utilities and base classes for [Lit](https://lit.dev), providing additional lifecycle hooks, decorators, and directives for building web components.

It re-exports `lit` together with its directives, replacing `html` and some of its decorators with its own, so a project imports everything from `@a11d/lit` rather than from `lit`.

## Installation

```bash
npm install @a11d/lit
```

<!-- features -->
## Features

- **[`Component` class](https://github.com/a11delavar/lit/tree/main/packages/Lit/Component)** - The `Component` class is the base class for all components.
- **[`ComponentPart` class](https://github.com/a11delavar/lit/tree/main/packages/Lit/ComponentPart)** - A `ComponentPart` is a part of a component, extracted into a class of its own **without introducing a component boundary**.
- **[`Controller` class](https://github.com/a11delavar/lit/tree/main/packages/Lit/Controller)** - A base class for [reactive controllers](https://lit.dev/docs/composition/controllers/) which registers itself with its host, so implementations only define the callbacks they are interested in.
- **[`ElementRef` / `ElementRefs` classes](https://github.com/a11delavar/lit/tree/main/packages/Lit/ElementRef)** - The element — or the elements — a template designates, with whatever it declares about them.
- **[`style` Directive](https://github.com/a11delavar/lit/tree/main/packages/Lit/style)** - Apply inline styles to elements with proper typing and reactivity.
- **[`updated` Decorator](https://github.com/a11delavar/lit/tree/main/packages/Lit/updated)** - React to property changes with callbacks.
- **[`eventListener` Decorator](https://github.com/a11delavar/lit/tree/main/packages/Lit/eventListener)** - Declaratively register event listeners on methods.
- **[`event` Decorator](https://github.com/a11delavar/lit/tree/main/packages/Lit/event)** - Create type-safe custom event dispatchers for your components.
- **[`bind` Directive](https://github.com/a11delavar/lit/tree/main/packages/Lit/bind)** - Two-way data binding for Lit components.
<!-- /features -->

<!-- exports -->
## Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Component` | class |  |
| `ComponentPart` | class | A part of a component, extracted into a class of its own without introducing a component boundary. |
| `Controller` | class |  |
| `ElementRef` | class | A single element, designated by the template and read back wherever it is needed. |
| `ElementRefs` | class | The elements a template designates, each with the options it declares. |
| `StyleDirective` | class |  |
| `UpdatedController` | class |  |
| `EventListenerController` | class |  |
| `PureEventDispatcher` | class |  |
| `HTMLElementEventDispatcher` | class |  |
| `Binder` | class | A utility to facilitate binding to a property of a reactive element. |
| `BindingIntegration` | class |  |
| `html` | function |  |
| `queryConnectedInstances` | function | Decorator that adds a property of type "Set" to a component class which contains all connected instances of that component. |
| `extractEventTargets` | function |  |
| `extractOptions` | function |  |
| `event` | function |  |
| `bindingDefaultProperty` | function |  |
| `associatedEvent` | function |  |
| `BindingMode` | enum |  |
| `component` | const |  |
| `host` | const | The symbol resolving the `ReactiveElement` which owns the update lifecycle of a given context. |
| `query` | const |  |
| `queryAll` | const |  |
| `queryAllAsNodeList` | const |  |
| `style` | const |  |
| `updated` | const |  |
| `eventListener` | const |  |
| `extractEventHandler` | const | The function an event listener runs, which for a template's event binding also passes on what the bound function returns. |
| `bindingDefaultPropertyKey` | const |  |
| `associatedEventsByPropertiesKey` | const |  |
| `bind` | const |  |
| `bindingIntegrations` | const |  |
| `bindingIntegration` | const |  |
| `property` | const |  |
| `state` | const |  |
| `ElementRefLifecycle` | interface | The lifecycle of the element or elements a reference holds. |
| `BindSource` | type | The source a binding can be established on. |
<!-- /exports -->