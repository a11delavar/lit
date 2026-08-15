import { bind, type BindDirectiveParametersOptions, type BindSource } from './BindDirective.js'

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
	constructor(readonly host: BindSource, readonly key: string) { }

	bind = (...[parameter]: BinderParameters<T>) => {
		const key = this.key as keyof BindSource
		const parameters = (typeof parameter === 'string' ? { keyPath: parameter } : parameter) as BindDirectiveParametersOptions<T>
		return bind(this.host, key, this.getParameters(parameters) as unknown as BindDirectiveParametersOptions<BindSource[keyof BindSource]>)
	}

	protected getParameters(parameters: BindDirectiveParametersOptions<T>): BindDirectiveParametersOptions<T> {
		return parameters
	}
}