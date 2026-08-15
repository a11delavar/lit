# `@a11d/lit`

Enhanced utilities and base classes for [Lit](https://lit.dev), providing additional lifecycle hooks, decorators, and directives for building web components.

## Installation

```bash
npm install @a11d/lit
```

## Features

- **[`Component` class](/packages/Lit/Component/README.md)** - Extended base class with additional lifecycle callbacks
- **[`ComponentPart` class](/packages/Lit/ComponentPart/README.md)** - Break up a large component without introducing a component boundary
- **[`Controller` class](/packages/Lit/Controller/README.md)** - Base class for self-registering reactive controllers
- **[`updated` Decorator](/packages/Lit/updated/README.md)** - React to property changes with callbacks
- **[`event` Decorator](/packages/Lit/event/README.md)** - Type-safe custom event dispatchers
- **[`eventListener` Decorator](/packages/Lit/eventListener/README.md)** - Declarative event listener registration
- **[`style` Directive](/packages/Lit/style/README.md)** - Inline style binding
- **[`bind` Directive](/packages/Lit/bind/README.md)** - Two-way data binding with automatic event detection