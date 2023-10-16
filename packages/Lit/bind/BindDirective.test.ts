import { ComponentTestFixture } from '@a11d/lit-testing'
import '../index.js'
import { event, Component, html, property, state, query, staticHtml, literal, unsafeStatic, TemplateResult, StaticValue } from '../index'
import { bind } from './BindDirective.js'

function expectBindToPass<T>(parameters: {
	initialValue: T
	updatedValue: T
	// eslint-disable-next-line
	converterType: String | Number | Boolean | Object
	getTemplate: (tag: StaticValue, bind: unknown) => TemplateResult
}) {
	const { initialValue, updatedValue, converterType, getTemplate } = parameters

	const random = () => Math.random().toString(36).slice(2)
	const tagSuffix = random()

	class TestBindableComponent extends Component {
		@event() readonly change: EventDispatcher<T>
		@property({ type: converterType, bindingDefault: true }) value?: T

		registeredEventsCount = 0

		addEventListener(...parameters: Parameters<typeof Component.prototype.addEventListener>) {
			super.addEventListener(...parameters)
			this.registeredEventsCount++
		}

		removeEventListener(...parameters: Parameters<typeof Component.prototype.removeEventListener>) {
			super.removeEventListener(...parameters)
			this.registeredEventsCount--
		}
	}
	const bindableComponentTagName = `test-bindable-component-${tagSuffix}`
	customElements.define(bindableComponentTagName, TestBindableComponent)
	const tag = literal`${unsafeStatic(bindableComponentTagName)}`

	interface TestBinderComponent extends Component {
		readonly bindableComponent: TestBindableComponent
	}

	const expectBindingToPass = (parameters: {
		fixture: ComponentTestFixture<TestBinderComponent>
		property: string
		keyPath?: string
	}) => {
		const fixture = parameters.fixture
		const property = parameters.property
		const keyPath = !parameters.keyPath ? property : `${property}.${parameters.keyPath}`

		it('should initialize from source', () => {
			expect(fixture.component.bindableComponent.value).toBe(initialValue)
		})

		it('should bind from source', async () => {
			setValueByKeyPath(fixture.component as any, keyPath, updatedValue)
			fixture.component.requestUpdate(property)
			await fixture.updateComplete
			expect(fixture.component.bindableComponent.value).toBe(updatedValue)
		})

		it('should update the source when dispatching associated event', async () => {
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(getValueByKeyPath(fixture.component as any, keyPath)).toBe(updatedValue)
		})

		it('should call requestUpdate with the property key', async () => {
			spyOn(fixture.component, 'requestUpdate')
			fixture.component.bindableComponent.change.dispatch(updatedValue)
			await fixture.updateComplete
			expect(fixture.component.requestUpdate).toHaveBeenCalledWith(property)
		})

		it('should remove the event listener when disconnected', () => {
			expect(fixture.component.bindableComponent.registeredEventsCount).toBe(1)

			fixture.component.remove()

			expect(fixture.component.bindableComponent.registeredEventsCount).toBe(0)
		})
	}

	describe('direct binding', () => {
		class TestDirectBinderComponent extends Component {
			@state() value = initialValue

			@query(bindableComponentTagName) readonly bindableComponent!: TestBindableComponent

			get template() {
				return html`${getTemplate(tag, bind(this, 'value'))}`
			}
		}
		customElements.define(`test-direct-binder-component-${tagSuffix}`, TestDirectBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestDirectBinderComponent)

		expectBindingToPass({ fixture, property: 'value' })
	})

	describe('deep binding', () => {
		class TestDeepBinderComponent extends Component {
			@state() deep = { object: { value: initialValue } }

			@query(bindableComponentTagName) readonly bindableComponent!: TestBindableComponent

			get template() {
				return html`${getTemplate(tag, bind(this as TestDeepBinderComponent, 'deep', { keyPath: 'object.value' }))}`
			}
		}

		customElements.define(`test-deep-binder-component-${tagSuffix}`, TestDeepBinderComponent)

		const fixture = new ComponentTestFixture(() => new TestDeepBinderComponent)

		it('should update on explicit requestUpdate', async () => {
			fixture.component.deep.object.value = updatedValue
			await fixture.update()
			expect(fixture.component.bindableComponent.value).toBe(updatedValue)
		})

		expectBindingToPass({ fixture, property: 'deep', keyPath: 'object.value' })
	})
}


describe('BindDirective', () => {
	describe('attribute', () => {
		expectBindToPass({
			initialValue: 'initial',
			updatedValue: 'updated',
			converterType: String,
			getTemplate: (tag, bind) => staticHtml`<${tag} value=${bind}></${tag}>`,
		})
	})

	describe('boolean attribute', () => {
		expectBindToPass({
			initialValue: undefined,
			updatedValue: true,
			converterType: Boolean,
			getTemplate: (tag, bind) => staticHtml`<${tag} ?value=${bind}></${tag}>`,
		})
	})

	describe('property', () => {
		expectBindToPass({
			initialValue: new Date('2023-01-01'),
			updatedValue: new Date('2024-01-01'),
			converterType: Object,
			getTemplate: (tag, bind) => staticHtml`<${tag} .value=${bind}></${tag}>`,
		})
	})

	describe('element', () => {
		expectBindToPass({
			initialValue: 'initial',
			updatedValue: 'updated',
			converterType: String,
			getTemplate: (tag, bind) => staticHtml`<${tag} ${bind}></${tag}>`,
		})
	})
})