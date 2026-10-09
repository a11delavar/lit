import { ComponentTestFixture } from '@a11d/lit-testing'
import { event, Component, html, nothing, property, render, state, query, staticHtml, literal, unsafeStatic, noChange, PartType, type TemplateResult, type StaticValue } from '../index.js'
import { BindingMode, bind } from './BindDirective.js'

function expectBindToPass<T>(parameters: {
	initialValue: T
	updatedValue: T
	converterType: typeof String | typeof Number | typeof Boolean | typeof Object
	getTemplate: (tag: StaticValue, bind: unknown) => TemplateResult
	clearedTargetValue: unknown
}) {
	const { initialValue, updatedValue, converterType, getTemplate, clearedTargetValue } = parameters

	const random = () => Math.random().toString(36).slice(2)
	const tagSuffix = random()

	class TestBindableComponent extends Component {
		@event() readonly change!: EventDispatcher<T>
		@property({ type: converterType, bindingDefault: true }) value?: T

		registeredEvents!: Record<string, EventListenerOrEventListenerObject>
		get registeredEventsCount() { return Object.keys(this.registeredEvents ?? {}).length }

		override addEventListener(...parameters: Parameters<typeof Component.prototype.addEventListener>) {
			super.addEventListener(...parameters)
			this.registeredEvents ??= {}
			this.registeredEvents[parameters[0]] = parameters[1]
		}

		override removeEventListener(...parameters: Parameters<typeof Component.prototype.removeEventListener>) {
			super.removeEventListener(...parameters)
			delete this.registeredEvents?.[parameters[0]]
		}
	}
	const bindableComponentTagName = `test-bindable-component-${tagSuffix}`
	customElements.define(bindableComponentTagName, TestBindableComponent)
	const tag = literal`${unsafeStatic(bindableComponentTagName)}`

	abstract class TestBinderComponent extends Component {
		@query(bindableComponentTagName) readonly bindableComponent!: TestBindableComponent
		sourceUpdate = vi.fn()
		sourceUpdated = vi.fn()
	}

	const expectBindingToPass = (parameters: {
		fixture: ComponentTestFixture<TestBinderComponent>
		property: string
		keyPath?: string
		expectedMode: BindingMode
		updateValue?: (updatedValue: T) => void
	}) => {
		const { fixture, property, expectedMode } = parameters
		const keyPath = !parameters.keyPath ? property : `${property}.${parameters.keyPath}`
		const updateValue = parameters.updateValue ?? (updatedValue => KeyPath.set(fixture.component as any, keyPath, updatedValue))

		const mit = (modes: Array<BindingMode>, name: string, callback: () => void) => {
			if (modes.includes(expectedMode)) {
				it(name, callback)
			}
		}

		mit([BindingMode.OneWay, BindingMode.TwoWay], 'should initialize from source to target', () => {
			expect(fixture.component.bindableComponent.value).toBe(initialValue)
		})

		mit([BindingMode.TwoWay], 'should bind from source to target', async () => {
			updateValue(updatedValue)
			fixture.component.requestUpdate(property)
			await fixture.updateComplete
			expect(fixture.component.bindableComponent.value).toBe(updatedValue)
		})

		mit([BindingMode.OneWay, BindingMode.TwoWay], 'should bind from source to target with explicit update request', async () => {
			updateValue(updatedValue)
			await fixture.update()
			expect(fixture.component.bindableComponent.value).toBe(updatedValue)
		})

		mit([BindingMode.OneWay, BindingMode.TwoWay], 'should clear the target when the source becomes undefined', async () => {
			updateValue(updatedValue)
			await fixture.update()
			expect(fixture.component.bindableComponent.value).toBe(updatedValue)
			updateValue(undefined as T)
			await fixture.update()
			expect(fixture.component.bindableComponent.value).toBe(clearedTargetValue as T)
		})

		mit([BindingMode.OneWayToSource], 'should not initialize from source to target', () => {
			if (converterType === Boolean) {
				expect(fixture.component.bindableComponent.value).toBe(undefined)
			} else {
				expect(fixture.component.bindableComponent.value).not.toBe(initialValue)
			}
		})

		mit([BindingMode.OneWayToSource], 'should not bind from source to target', async () => {
			updateValue(updatedValue)
			fixture.component.requestUpdate(property)
			await fixture.updateComplete
			expect(fixture.component.bindableComponent.value).not.toBe(updatedValue)
		})

		mit([BindingMode.OneWayToSource], 'should not bind from source to target with explicit update request', async () => {
			updateValue(updatedValue)
			await fixture.update()
			expect(fixture.component.bindableComponent.value).not.toBe(updatedValue)
		})

		mit([BindingMode.OneWayToSource, BindingMode.TwoWay], 'should bind from target to source when dispatching associated event', async () => {
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(KeyPath.get(fixture.component as any, keyPath)).toBe(updatedValue)
		})

		mit([BindingMode.OneWayToSource, BindingMode.TwoWay], 'should call sourceUpdate and sourceUpdated with the updated value while binding from target to source', async () => {
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(fixture.component.sourceUpdate).toHaveBeenCalledExactlyOnceWith(updatedValue)
			expect(KeyPath.get(fixture.component as any, keyPath)).toBe(updatedValue)
			expect(fixture.component.sourceUpdated).toHaveBeenCalledExactlyOnceWith(updatedValue)
		})

		mit([BindingMode.OneWayToSource, BindingMode.TwoWay], 'should call requestUpdate with the property key while binding from target to source', async () => {
			vi.spyOn(fixture.component, 'requestUpdate').mockImplementation(() => {})
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(fixture.component.requestUpdate).toHaveBeenCalledWith(property)
		})

		mit([BindingMode.OneWayToSource, BindingMode.TwoWay], 'should register one event listener while binding from target to source', () => {
			expect(fixture.component.bindableComponent.registeredEventsCount).toBe(1)
			fixture.component.remove()
			expect(fixture.component.bindableComponent.registeredEventsCount).toBe(0)
		})

		mit([BindingMode.OneWay], 'should not bind from target to source when dispatching associated event', async () => {
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(KeyPath.get(fixture.component as any, keyPath)).not.toBe(updatedValue)
		})

		mit([BindingMode.OneWay], 'should not call sourceUpdate and sourceUpdated with the updated value while not binding from target to source', async () => {
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(fixture.component.sourceUpdate).not.toHaveBeenCalledWith(updatedValue)
			expect(KeyPath.get(fixture.component as any, keyPath)).not.toBe(updatedValue)
			expect(fixture.component.sourceUpdated).not.toHaveBeenCalledWith(updatedValue)
		})

		mit([BindingMode.OneWay], 'should not call requestUpdate with the property key while not binding from target to source', async () => {
			vi.spyOn(fixture.component, 'requestUpdate').mockImplementation(() => {})
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(fixture.component.requestUpdate).not.toHaveBeenCalledWith(property)
		})

		mit([BindingMode.OneWay], 'should not register any event listeners while not binding from target to source', () => {
			expect(fixture.component.bindableComponent.registeredEventsCount).toBeLessThanOrEqual(0)
			fixture.component.remove()
			expect(fixture.component.bindableComponent.registeredEventsCount).toBeLessThanOrEqual(0)
		})
	}

	describe('non-deep two-way binding', () => {
		class TestNonDeepTwoWayBinderComponent extends TestBinderComponent {
			@state() value = initialValue

			override get template() {
				return html`${getTemplate(tag, bind(this, 'value', { sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}
		customElements.define(`test-non-deep-two-way-binder-component-${tagSuffix}`, TestNonDeepTwoWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestNonDeepTwoWayBinderComponent())

		expectBindingToPass({ fixture, property: 'value', expectedMode: BindingMode.TwoWay })
	})

	describe('associated event dispatching', () => {
		class TestDispatchingBinderComponent extends TestBinderComponent {
			@event() readonly change!: EventDispatcher<T>
			@state() value = initialValue

			override get template() {
				return html`${getTemplate(tag, bind(this, 'value', { dispatchAssociatedEvent: true, sourceUpdated: this.sourceUpdated }))}`
			}
		}
		customElements.define(`test-dispatching-binder-component-${tagSuffix}`, TestDispatchingBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestDispatchingBinderComponent())

		it('should dispatch the associated event on the source exactly once', async () => {
			const received = new Array<T>()
			fixture.component.change.subscribe(value => received.push(value))

			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete

			expect(received).toEqual([updatedValue])
		})

		it('should dispatch the associated event after the source has been updated', async () => {
			const sourceValues = new Array<T>()
			fixture.component.change.subscribe(() => sourceValues.push(fixture.component.value))

			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete

			expect(sourceValues).toEqual([updatedValue])
		})

		it('should not dispatch the associated event when the target is not the origin of the change', async () => {
			const received = new Array<T>()
			fixture.component.change.subscribe(value => received.push(value))

			fixture.component.value = updatedValue
			await fixture.update()

			expect(received).toEqual([])
		})
	})

	describe('associated event dispatching being opted out of', () => {
		class TestNonDispatchingBinderComponent extends TestBinderComponent {
			@event() readonly change!: EventDispatcher<T>
			@state() value = initialValue

			override get template() {
				return html`${getTemplate(tag, bind(this, 'value', { sourceUpdated: this.sourceUpdated }))}`
			}
		}
		customElements.define(`test-non-dispatching-binder-component-${tagSuffix}`, TestNonDispatchingBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestNonDispatchingBinderComponent())

		it('should not dispatch the associated event by default', async () => {
			const received = new Array<T>()
			fixture.component.change.subscribe(value => received.push(value))

			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete

			expect(fixture.component.sourceUpdated).toHaveBeenCalledExactlyOnceWith(updatedValue)
			expect(received).toEqual([])
		})
	})

	describe('associated event dispatching without an association', () => {
		class TestUnassociatedBinderComponent extends TestBinderComponent {
			@event() readonly change!: EventDispatcher<T>
			@state() unassociated = initialValue

			override get template() {
				return html`${getTemplate(tag, bind(this, 'unassociated', { dispatchAssociatedEvent: true, sourceUpdated: this.sourceUpdated }))}`
			}
		}
		customElements.define(`test-unassociated-binder-component-${tagSuffix}`, TestUnassociatedBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestUnassociatedBinderComponent())

		it('should update the source but dispatch nothing when the source property has no associated event', async () => {
			const received = new Array<unknown>()
			fixture.component.change.subscribe(value => received.push(value))
			fixture.component.addEventListener('unassociatedChange', e => received.push(e))

			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete

			expect(fixture.component.unassociated).toBe(updatedValue)
			expect(received).toEqual([])
		})
	})

	describe('two-way binding', () => {
		class TestDeepTwoWayBinderComponent extends TestBinderComponent {
			@state() deep = { object: { value: initialValue } }

			override get template() {
				return html`${getTemplate(tag, bind(this as TestDeepTwoWayBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-deep-two-way-binder-component-${tagSuffix}`, TestDeepTwoWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestDeepTwoWayBinderComponent())

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.TwoWay })
	})

	describe('two-way explicit binding', () => {
		class TestTwoWayExplicitBinderComponent extends TestBinderComponent {
			@state() deep = { object: { value: initialValue } }

			override get template() {
				return html`${getTemplate(tag, bind(this as TestTwoWayExplicitBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.TwoWay, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-deep-two-way-explicit-binder-component-${tagSuffix}`, TestTwoWayExplicitBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestTwoWayExplicitBinderComponent())

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.TwoWay })
	})

	describe('explicit one-way binding', () => {
		class TestExplicitOneWayBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue,
				},
			}

			override get template() {
				return html`${getTemplate(tag, bind(this as TestExplicitOneWayBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.OneWay, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-explicit-one-way-binder-component-${tagSuffix}`, TestExplicitOneWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestExplicitOneWayBinderComponent())

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.OneWay })
	})

	describe('implicit one-way binding', () => {
		class TestImplicitOneWayBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					_value: initialValue,
					get value() {
						return this._value
					},
				},
			}

			override get template() {
				return html`${getTemplate(tag, bind(this as TestImplicitOneWayBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-implicit-one-way-binder-component-${tagSuffix}`, TestImplicitOneWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestImplicitOneWayBinderComponent())

		expectBindingToPass({
			fixture,
			property: 'deep',
			keyPath: 'object.value',
			expectedMode: BindingMode.OneWay,
			updateValue: updatedValue => fixture.component.deep.object._value = updatedValue,
		})
	})

	describe('explicit one-way-to-source binding', () => {
		class TestExplicitOneWayToSourceBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue,
				},
			}

			override get template() {
				return html`${getTemplate(tag, bind(this as TestExplicitOneWayToSourceBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.OneWayToSource, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-explicit-one-way-to-source-binder-component-${tagSuffix}`, TestExplicitOneWayToSourceBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestExplicitOneWayToSourceBinderComponent())

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.OneWayToSource })
	})

	describe('implicit one-way-to-source binding', () => {
		const original = Object.isWritable
		beforeEach(() => {
			vi.spyOn(KeyPath, 'isWritable').mockReturnValue(true)
			vi.spyOn(Object, 'isWritable').mockImplementation((target: any, key: string) =>
				!(key === 'value' && (target.tagName?.toLowerCase().includes('implicit-one-way-to-source-binder') ?? false)) && original(target, key))
		})

		class TestImplicitOneWayToSourceBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue,
				},
			}

			override get template() {
				return html`${getTemplate(tag, bind(this as TestImplicitOneWayToSourceBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-implicit-one-way-to-source-binder-component-${tagSuffix}`, TestImplicitOneWayToSourceBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestImplicitOneWayToSourceBinderComponent())

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.OneWayToSource })
	})
}

describe('BindDirective', () => {
	describe('attribute', () => {
		expectBindToPass({
			initialValue: 'initial',
			updatedValue: 'updated',
			converterType: String,
			getTemplate: (tag, bind) => staticHtml`<${tag} value=${bind}></${tag}>`,
			clearedTargetValue: '',
		})
	})

	describe('boolean attribute', () => {
		expectBindToPass({
			initialValue: undefined,
			updatedValue: true,
			converterType: Boolean,
			getTemplate: (tag, bind) => staticHtml`<${tag} ?value=${bind}></${tag}>`,
			clearedTargetValue: false,
		})
	})

	describe('property', () => {
		expectBindToPass({
			initialValue: new Date('2023-01-01'),
			updatedValue: new Date('2024-01-01'),
			converterType: Object,
			getTemplate: (tag, bind) => staticHtml`<${tag} .value=${bind}></${tag}>`,
			clearedTargetValue: undefined,
		})
	})

	describe('element', () => {
		expectBindToPass({
			initialValue: 'initial',
			updatedValue: 'updated',
			converterType: String,
			getTemplate: (tag, bind) => staticHtml`<${tag} ${bind}></${tag}>`,
			clearedTargetValue: undefined,
		})
	})

	describe('server-side rendering', () => {
		const source = { value: 'initial', deep: { value: 'deep' } }

		// The server calls nothing but `render`, with the directive's parameters:
		const renderOnServer = (result: unknown) => {
			const { _$litDirective$: Directive, values } = result as { _$litDirective$: new (partInfo: unknown) => { render(...values: Array<unknown>): unknown }, values: Array<unknown> }
			return new Directive({ type: PartType.ATTRIBUTE, name: 'value', strings: ['', ''] }).render(...values)
		}

		it('should render the source value into an attribute', () => {
			expect(renderOnServer(bind(source as any, 'value'))).toBe('initial')
		})

		it('should render the value at the key path', () => {
			expect(renderOnServer(bind(source as any, 'deep', { keyPath: 'value' }))).toBe('deep')
		})

		it('should render nothing for a one-way-to-source binding', () => {
			expect(renderOnServer(bind(source as any, 'value', { mode: BindingMode.OneWayToSource }))).toBe(noChange)
		})
	})
})

describe('BindDirective re-entrancy', () => {
	describe('of a binding whose associated event is observed', () => {
		class TestReentrantBinderComponent extends Component {
			@event() readonly change!: EventDispatcher<string>
			@state() value = ''
			@query('input') readonly input!: HTMLInputElement

			readonly sourceUpdated = vi.fn()

			override get template() {
				return html`<input ${bind(this, 'value', { dispatchAssociatedEvent: true, sourceUpdated: this.sourceUpdated })}>`
			}
		}
		customElements.define('test-reentrant-binder-component', TestReentrantBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestReentrantBinderComponent())

		const changeTargetValue = (value: string) => {
			fixture.component.input.value = value
			fixture.component.input.dispatchEvent(new Event('change'))
		}

		it('should update the source once per target event', () => {
			changeTargetValue('a')

			expect(fixture.component.sourceUpdated).toHaveBeenCalledTimes(1)
			expect(fixture.component.value).toBe('a')
		})

		it('should keep updating the source for subsequent target events', () => {
			changeTargetValue('a')
			changeTargetValue('b')
			changeTargetValue('c')

			expect(fixture.component.sourceUpdated).toHaveBeenCalledTimes(3)
			expect(fixture.component.value).toBe('c')
		})

		it('should not re-enter when a listener of the associated event dispatches the target event again', () => {
			fixture.component.change.subscribe(() => changeTargetValue('feedback'))

			changeTargetValue('a')

			expect(fixture.component.sourceUpdated).toHaveBeenCalledTimes(1)
			expect(fixture.component.value).toBe('a')
		})

		it('should keep updating the source after a feedback loop has been broken', () => {
			const handler = () => changeTargetValue('feedback')
			fixture.component.change.subscribe(handler)
			changeTargetValue('a')
			fixture.component.change.unsubscribe(handler)

			changeTargetValue('b')

			expect(fixture.component.sourceUpdated).toHaveBeenCalledTimes(2)
			expect(fixture.component.value).toBe('b')
		})
	})

	describe('of a binding whose lifecycle callbacks dispatch the target event', () => {
		class TestReentrantCallbackComponent extends Component {
			@event() readonly change!: EventDispatcher<string>
			@state() value = ''
			@query('input') readonly input!: HTMLInputElement

			readonly sourceUpdate = vi.fn(() => this.redispatch())
			readonly sourceUpdated = vi.fn(() => this.redispatch())

			private redispatch() {
				this.input.dispatchEvent(new Event('change'))
			}

			override get template() {
				return html`<input ${bind(this, 'value', { dispatchAssociatedEvent: true, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated })}>`
			}
		}
		customElements.define('test-reentrant-callback-component', TestReentrantCallbackComponent)

		const fixture = new ComponentTestFixture(() => new TestReentrantCallbackComponent())

		it('should not re-enter when "sourceUpdate" or "sourceUpdated" dispatch the target event again', () => {
			fixture.component.input.value = 'a'
			fixture.component.input.dispatchEvent(new Event('change'))

			expect(fixture.component.sourceUpdate).toHaveBeenCalledTimes(1)
			expect(fixture.component.sourceUpdated).toHaveBeenCalledTimes(1)
			expect(fixture.component.value).toBe('a')
		})
	})

	describe('of a binding whose source is its own target', () => {
		class TestReentrantBindableComponent extends Component {
			@event() readonly change!: EventDispatcher<string>
			@property({ bindingDefault: true }) value = ''
		}
		customElements.define('test-reentrant-bindable-component', TestReentrantBindableComponent)

		const template = (binding: unknown) => html`<test-reentrant-bindable-component ${binding as never}></test-reentrant-bindable-component>`

		let container: HTMLDivElement
		beforeEach(() => {
			container = document.createElement('div')
			document.body.appendChild(container)
		})
		afterEach(() => container.remove())

		it('should not re-enter when the source and the target are the same element', () => {
			render(template(nothing), container)
			const element = container.firstElementChild as TestReentrantBindableComponent
			const sourceUpdated = vi.fn()
			render(template(bind(element, 'value', { dispatchAssociatedEvent: true, sourceUpdated })), container)

			element.change.dispatch('a')

			expect(sourceUpdated).toHaveBeenCalledTimes(1)
			expect(element.value).toBe('a')
		})
	})

	describe('of two bindings on the same element', () => {
		class TestDoublyBoundComponent extends Component {
			@event() readonly change!: EventDispatcher<string>
			@event() readonly otherChange!: EventDispatcher<boolean>
			@state() value = ''
			@state() other = false
			@query('input') readonly input!: HTMLInputElement

			readonly valueUpdated = vi.fn()
			readonly otherUpdated = vi.fn()

			override get template() {
				return html`<input
						.value=${bind(this, 'value', { dispatchAssociatedEvent: true, sourceUpdated: this.valueUpdated })}
						?disabled=${bind(this, 'other', { dispatchAssociatedEvent: true, sourceUpdated: this.otherUpdated })}
					>`
			}
		}
		customElements.define('test-doubly-bound-component', TestDoublyBoundComponent)

		const fixture = new ComponentTestFixture(() => new TestDoublyBoundComponent())

		it('should not let the bindings feed each other', () => {
			fixture.component.input.value = 'a'
			fixture.component.input.dispatchEvent(new Event('change'))

			expect(fixture.component.valueUpdated).toHaveBeenCalledTimes(1)
			expect(fixture.component.otherUpdated).toHaveBeenCalledTimes(1)
			expect(fixture.component.value).toBe('a')
		})
	})
})
