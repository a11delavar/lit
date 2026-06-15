import { ComponentTestFixture } from '@a11d/lit-testing'
import '../index.js'
import { event, Component, html, property, state, query, staticHtml, literal, unsafeStatic, type TemplateResult, type StaticValue } from '../index'
import { BindingMode, bind } from './BindDirective.js'

function expectBindToPass<T>(parameters: {
	initialValue: T
	updatedValue: T
	// eslint-disable-next-line
	converterType: String | Number | Boolean | Object
	getTemplate: (tag: StaticValue, bind: unknown) => TemplateResult
	clearedTargetValue: unknown
}) {
	const { initialValue, updatedValue, converterType, getTemplate, clearedTargetValue } = parameters

	const random = () => Math.random().toString(36).slice(2)
	const tagSuffix = random()

	class TestBindableComponent extends Component {
		@event() readonly change: EventDispatcher<T>
		@property({ type: converterType, bindingDefault: true }) value?: T

		registeredEvents!: Record<string, EventListenerOrEventListenerObject>
		get registeredEventsCount() { return Object.keys(this.registeredEvents ?? {}).length }

		addEventListener(...parameters: Parameters<typeof Component.prototype.addEventListener>) {
			super.addEventListener(...parameters)
			this.registeredEvents ??= {}
			this.registeredEvents[parameters[0]] = parameters[1]
		}

		removeEventListener(...parameters: Parameters<typeof Component.prototype.removeEventListener>) {
			super.removeEventListener(...parameters)
			delete this.registeredEvents?.[parameters[0]]
		}
	}
	const bindableComponentTagName = `test-bindable-component-${tagSuffix}`
	customElements.define(bindableComponentTagName, TestBindableComponent)
	const tag = literal`${unsafeStatic(bindableComponentTagName)}`

	abstract class TestBinderComponent extends Component {
		@query(bindableComponentTagName) readonly bindableComponent!: TestBindableComponent
		sourceUpdate = jasmine.createSpy('sourceUpdate')
		sourceUpdated = jasmine.createSpy('sourceUpdated')
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
			expect(fixture.component.sourceUpdate).toHaveBeenCalledOnceWith(updatedValue)
			expect(KeyPath.get(fixture.component as any, keyPath)).toBe(updatedValue)
			expect(fixture.component.sourceUpdated).toHaveBeenCalledOnceWith(updatedValue)
		})

		mit([BindingMode.OneWayToSource, BindingMode.TwoWay], 'should call requestUpdate with the property key while binding from target to source', async () => {
			spyOn(fixture.component, 'requestUpdate')
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
			spyOn(fixture.component, 'requestUpdate')
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

			get template() {
				return html`${getTemplate(tag, bind(this, 'value', { sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}
		customElements.define(`test-non-deep-two-way-binder-component-${tagSuffix}`, TestNonDeepTwoWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestNonDeepTwoWayBinderComponent)

		expectBindingToPass({ fixture, property: 'value', expectedMode: BindingMode.TwoWay })
	})

	describe('two-way binding', () => {
		class TestDeepTwoWayBinderComponent extends TestBinderComponent {
			@state() deep = { object: { value: initialValue } }

			get template() {
				return html`${getTemplate(tag, bind(this as TestDeepTwoWayBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-deep-two-way-binder-component-${tagSuffix}`, TestDeepTwoWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestDeepTwoWayBinderComponent)

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.TwoWay })
	})

	describe('two-way explicit binding', () => {
		class TestTwoWayExplicitBinderComponent extends TestBinderComponent {
			@state() deep = { object: { value: initialValue } }

			get template() {
				return html`${getTemplate(tag, bind(this as TestTwoWayExplicitBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.TwoWay, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-deep-two-way-explicit-binder-component-${tagSuffix}`, TestTwoWayExplicitBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestTwoWayExplicitBinderComponent)

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.TwoWay })
	})

	describe('explicit one-way binding', () => {
		class TestExplicitOneWayBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue
				}
			}

			get template() {
				return html`${getTemplate(tag, bind(this as TestExplicitOneWayBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.OneWay, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-explicit-one-way-binder-component-${tagSuffix}`, TestExplicitOneWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestExplicitOneWayBinderComponent)

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.OneWay })
	})

	describe('implicit one-way binding', () => {
		class TestImplicitOneWayBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					_value: initialValue,
					get value() {
						return this._value
					}
				}
			}

			get template() {
				return html`${getTemplate(tag, bind(this as TestImplicitOneWayBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-implicit-one-way-binder-component-${tagSuffix}`, TestImplicitOneWayBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestImplicitOneWayBinderComponent)

		expectBindingToPass({
			fixture,
			property: 'deep',
			keyPath: 'object.value',
			expectedMode: BindingMode.OneWay,
			updateValue: updatedValue => fixture.component.deep.object._value = updatedValue
		})
	})

	describe('explicit one-way-to-source binding', () => {
		class TestExplicitOneWayToSourceBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue
				}
			}

			get template() {
				return html`${getTemplate(tag, bind(this as TestExplicitOneWayToSourceBinderComponent, 'deep', { keyPath: 'object.value', mode: BindingMode.OneWayToSource, sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-explicit-one-way-to-source-binder-component-${tagSuffix}`, TestExplicitOneWayToSourceBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestExplicitOneWayToSourceBinderComponent)

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value', expectedMode: BindingMode.OneWayToSource })
	})

	describe('implicit one-way-to-source binding', () => {
		const original = Object.isWritable
		beforeAll(() => {
			spyOn(KeyPath, 'isWritable').and.returnValue(true)
			spyOn(Object, 'isWritable').and.callFake((target: any, key: string) =>
				!(key === 'value' && (target.tagName?.toLowerCase().includes('implicit-one-way-to-source-binder') ?? false)) && original(target, key))
		})

		class TestImplicitOneWayToSourceBinderComponent extends TestBinderComponent {
			@state() deep = {
				object: {
					value: initialValue
				}
			}

			get template() {
				return html`${getTemplate(tag, bind(this as TestImplicitOneWayToSourceBinderComponent, 'deep', { keyPath: 'object.value', sourceUpdate: this.sourceUpdate, sourceUpdated: this.sourceUpdated }))}`
			}
		}

		customElements.define(`test-implicit-one-way-to-source-binder-component-${tagSuffix}`, TestImplicitOneWayToSourceBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestImplicitOneWayToSourceBinderComponent)

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

	describe('dispatchChangeEvent option', () => {
		describe('should automatically dispatch the associated event when source value changes', () => {
			class TestBindableComponent extends Component {
				@event() readonly change: EventDispatcher<string>
				@property({ type: String, bindingDefault: true }) value = ''
			}
			customElements.define('test-dispatch-event-bindable', TestBindableComponent)

			class TestBinderComponent extends Component {
				@query('test-dispatch-event-bindable') readonly bindableComponent!: TestBindableComponent
				@state() sourceValue = 'initial'

				get template() {
					return html`<test-dispatch-event-bindable ${bind(this, 'sourceValue', { dispatchChangeEvent: true })}></test-dispatch-event-bindable>`
				}
			}
			customElements.define('test-dispatch-event-binder', TestBinderComponent)

			const fixture = new ComponentTestFixture(() => new TestBinderComponent)

			it('should dispatch event on initial render', async () => {
				await fixture.updateComplete

				const eventSpy = jasmine.createSpy('eventSpy')
				fixture.component.bindableComponent.addEventListener('change', eventSpy)

				// Trigger re-render to get the value
				fixture.component.sourceValue = 'initial-trigger'
				await fixture.updateComplete

				expect(eventSpy).toHaveBeenCalledTimes(1)
				expect(eventSpy).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'initial-trigger' }))
			})

			it('should dispatch event on source update', async () => {
				await fixture.updateComplete

				const eventSpy = jasmine.createSpy('eventSpy')
				fixture.component.bindableComponent.addEventListener('change', eventSpy)

				fixture.component.sourceValue = 'updated'
				await fixture.updateComplete

				expect(eventSpy).toHaveBeenCalledTimes(1)
				expect(eventSpy).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'updated' }))
			})
		})

		describe('should dispatch custom event name when event option is specified', () => {
			class TestBindableComponent extends Component {
				@event() readonly customChange: EventDispatcher<string>
				@property({ type: String, bindingDefault: true, event: 'customChange' }) value = ''
			}
			customElements.define('test-dispatch-custom-event-bindable', TestBindableComponent)

			class TestBinderComponent extends Component {
				@query('test-dispatch-custom-event-bindable') readonly bindableComponent!: TestBindableComponent
				@state() sourceValue = 'initial'

				get template() {
					return html`<test-dispatch-custom-event-bindable ${bind(this, 'sourceValue', { event: 'customChange', dispatchChangeEvent: true })}></test-dispatch-custom-event-bindable>`
				}
			}
			customElements.define('test-dispatch-custom-event-binder', TestBinderComponent)

			const fixture = new ComponentTestFixture(() => new TestBinderComponent)

			it('should dispatch custom event on source update', async () => {
				await fixture.updateComplete

				const eventSpy = jasmine.createSpy('eventSpy')
				fixture.component.bindableComponent.addEventListener('customChange', eventSpy)

				fixture.component.sourceValue = 'updated'
				await fixture.updateComplete

				expect(eventSpy).toHaveBeenCalledTimes(1)
				expect(eventSpy).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'updated' }))
			})
		})

		describe('should not dispatch event when dispatchChangeEvent is false', () => {
			class TestBindableComponent extends Component {
				@event() readonly change: EventDispatcher<string>
				@property({ type: String, bindingDefault: true }) value = ''
			}
			customElements.define('test-no-dispatch-event-bindable', TestBindableComponent)

			class TestBinderComponent extends Component {
				@query('test-no-dispatch-event-bindable') readonly bindableComponent!: TestBindableComponent
				@state() sourceValue = 'initial'

				get template() {
					return html`<test-no-dispatch-event-bindable ${bind(this, 'sourceValue', { dispatchChangeEvent: false })}></test-no-dispatch-event-bindable>`
				}
			}
			customElements.define('test-no-dispatch-event-binder', TestBinderComponent)

			const fixture = new ComponentTestFixture(() => new TestBinderComponent)

			it('should not dispatch event on source update', async () => {
				await fixture.updateComplete

				const eventSpy = jasmine.createSpy('eventSpy')
				fixture.component.bindableComponent.addEventListener('change', eventSpy)

				expect(eventSpy).not.toHaveBeenCalled()

				fixture.component.sourceValue = 'updated'
				await fixture.updateComplete

				expect(eventSpy).not.toHaveBeenCalled()
			})
		})

		describe('should not dispatch event in OneWayToSource mode', () => {
			class TestBindableComponent extends Component {
				@event() readonly change: EventDispatcher<string>
				@property({ type: String, bindingDefault: true }) value = ''
			}
			customElements.define('test-dispatch-one-way-to-source-bindable', TestBindableComponent)

			class TestBinderComponent extends Component {
				@query('test-dispatch-one-way-to-source-bindable') readonly bindableComponent!: TestBindableComponent
				@state() sourceValue = 'initial'

				get template() {
					return html`<test-dispatch-one-way-to-source-bindable ${bind(this, 'sourceValue', { mode: BindingMode.OneWayToSource, dispatchChangeEvent: true })}></test-dispatch-one-way-to-source-bindable>`
				}
			}
			customElements.define('test-dispatch-one-way-to-source-binder', TestBinderComponent)

			const fixture = new ComponentTestFixture(() => new TestBinderComponent)

			it('should not dispatch event on source update', async () => {
				await fixture.updateComplete

				const eventSpy = jasmine.createSpy('eventSpy')
				fixture.component.bindableComponent.addEventListener('change', eventSpy)

				expect(eventSpy).not.toHaveBeenCalled()

				fixture.component.sourceValue = 'updated'
				await fixture.updateComplete

				expect(eventSpy).not.toHaveBeenCalled()
			})
			clearedTargetValue: undefined,
		})
	})
})