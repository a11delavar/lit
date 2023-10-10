import { LitElement, HTMLTemplateResult, render } from '@a11d/lit'

type ConstructorParameters<TComponent extends LitElement> =
	| [tagName: string]
	| [constructComponent: () => TComponent]
	| [templateConsistingOfComponentAsRoot: HTMLTemplateResult]

export class ComponentTestFixture<TComponent extends LitElement> {
	private _component?: TComponent
	get component() { return this._component as TComponent }

	private readonly parameters: ConstructorParameters<TComponent>
	constructor(...parameters: ConstructorParameters<TComponent>) {
		this.parameters = parameters
		beforeEach(() => this.initialize())
		afterEach(() => this._component?.remove())
	}

	async initialize() {
		this._component?.remove()
		this._component = this.constructComponent()
		document.body.appendChild(this._component)
		await this.updateComplete
		return this._component
	}

	private constructComponent() {
		const [parameter] = this.parameters

		if (typeof parameter === 'string') {
			return document.createElement(parameter) as TComponent
		}

		if (parameter instanceof Function) {
			return parameter()
		}

		const div = document.createElement('div')
		render(parameter, div)
		return div.firstElementChild as TComponent
	}

	get updateComplete() {
		return this._component?.updateComplete
	}

	requestUpdate() {
		this._component?.requestUpdate()
	}

	async update() {
		this.requestUpdate()
		await this.updateComplete
	}
}