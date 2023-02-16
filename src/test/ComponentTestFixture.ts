export class ComponentTestFixture<TComponent extends import('lit').LitElement> {
	private _component?: TComponent
	get component() { return this._component! }

	constructor(private readonly constructComponentOrTagName: string | (() => TComponent)) {
		beforeEach(() => this.initialize())
		afterEach(() => this._component?.remove())
	}

	async initialize() {
		this._component?.remove()
		const constructComponent = typeof this.constructComponentOrTagName === 'string'
			? () => document.createElement(this.constructComponentOrTagName as string) as TComponent
			: this.constructComponentOrTagName
		this._component = constructComponent()
		document.body.appendChild(this._component)
		await this._component.updateComplete
		return this._component
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