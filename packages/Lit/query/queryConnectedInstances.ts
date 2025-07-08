import { type LitElement } from 'lit'

const propertyName = Symbol('ConnectedInstances')

/**
 * Decorator that adds a property of type "Set" to a component class
 * which contains all connected instances of that component.
 *
 * @ssr true
 *
 * @example
 * ```
 * export class Foo extends Component {
 *     //` @queryConnectedInstances() static readonly instances!: Set<Foo>
 * }
 * ```
 */
export function queryConnectedInstances() {
	return (elementConstructor: AbstractConstructor<LitElement>, propertyKey: string) => {
		const constructor = elementConstructor as AbstractConstructor<LitElement> & typeof LitElement
		Object.defineProperty(constructor, propertyName, { value: new Set<LitElement>() })

		constructor.addInitializer(element => element.addController({
			hostConnected: () => (element.constructor as any)[propertyName].add(element),
			hostDisconnected: () => (element.constructor as any)[propertyName].delete(element)
		}))

		Object.defineProperty(constructor, propertyKey, {
			configurable: false,
			get(this: AbstractConstructor<LitElement>) {
				return (this as any)[propertyName]
			},
		})
	}
}