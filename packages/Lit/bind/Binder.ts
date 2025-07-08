import { type ReactiveElement } from 'lit'
import { bind, type BindDirectiveParametersOptions } from './BindDirective.js'

type BinderParameters<T> =
	| [keyPath: KeyPath.Of<T>]
	| [options: BindDirectiveParametersOptions<T>]

/**
 * A utility to facilitate binding to a property of a reactive element.
 *
 * @example
 * ```ts
 * class MyComponent extends Component {
 *     state() data = { name: 'John' }
 *
 *     binder = new Binder(this, 'data')
 *
 *     get template() {
 *         return html`
 *             <input placeholder='With Binder' ${this.binder.bind('name')} />
 *             <input placeholder='Without Binder' ${bind(this, 'data', { keyPath: 'name' })} />
 *         `
 *     }
 * }
 * ```
 */
export class Binder<T> {
	constructor(readonly host: ReactiveElement, readonly key: string) { }

	bind = (...[parameter]: BinderParameters<T>) => {
		const key = this.key as keyof ReactiveElement
		const parameters = (typeof parameter === 'string' ? { keyPath: parameter } : parameter) as BindDirectiveParametersOptions<T>
		return bind(this.host, key, this.getParameters(parameters) as unknown as BindDirectiveParametersOptions<ReactiveElement[keyof ReactiveElement]>)
	}

	protected getParameters(parameters: BindDirectiveParametersOptions<T>): BindDirectiveParametersOptions<T> {
		return parameters
	}
}