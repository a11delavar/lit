import { ComponentTestFixture } from '@a11d/lit-testing'
import { query } from '../query'
import { Component, html, component } from '../Component'
import { Binder } from './Binder'
import { bindingIntegration, BindingIntegration } from './BindingIntegration'
import { type ValueBinder } from './ValueBinder'
import { BindingMode, property } from '..'

@bindingIntegration()
class TestRequiredIntegration extends BindingIntegration {
	bind({ source, element }: ValueBinder) {
		if (element instanceof HTMLInputElement && source.integrate) {
			element.required = source.required
		}
	}
}

TestRequiredIntegration

describe('BindingIntegration', () => {
	@component('test-binding-integration-application')
	class TestBindingIntegrationApplication extends Component {
		constructor() { super() }

		@property({ type: Object }) readonly data?: {
			integrate: boolean
			required: boolean
			value: string
		}

		private readonly binder = new Binder(this, 'data')

		@query('input') readonly input!: HTMLInputElement

		get template() {
			return html`<input ${this.binder.bind('value')}>`
		}
	}

	const fixtureAppliedRequired = new ComponentTestFixture<TestBindingIntegrationApplication>(html`
		<test-binding-integration-application .data=${{ integrate: true, required: true, value: 'test' }}></test-binding-integration-application>
	`)

	const fixtureAppliedNotRequired = new ComponentTestFixture<TestBindingIntegrationApplication>(html`
		<test-binding-integration-application .data=${{ integrate: true, required: false, value: 'test' }}></test-binding-integration-application>
	`)

	it('should apply the integration when condition is met', () => {
		expect(fixtureAppliedRequired.component.input.required).toBe(true)
		expect(fixtureAppliedNotRequired.component.input.required).toBe(false)
	})

	const fixtureNotAppliedRequired = new ComponentTestFixture<TestBindingIntegrationApplication>(html`
		<test-binding-integration-application .data=${{ integrate: false, required: false, value: 'test' }}></test-binding-integration-application>
	`)

	const fixtureNotAppliedNotRequired = new ComponentTestFixture<TestBindingIntegrationApplication>(html`
		<test-binding-integration-application .data=${{ integrate: false, required: false, value: 'test' }}></test-binding-integration-application>
	`)

	it('should apply the integration when condition is bot met', () => {
		expect(fixtureNotAppliedRequired.component.input.required).toBe(false)
		expect(fixtureNotAppliedNotRequired.component.input.required).toBe(false)
	})

	@component('test-binding-integration-conflict')
	class TestBindingIntegrationConflict extends Component {
		constructor() { super() }

		@property({ type: Boolean }) readonly required = false

		@property({ type: Object }) readonly data?: {
			integrate: boolean
			required: boolean
			value: string
		}

		private readonly binder = new Binder(this, 'data')

		@query('input') readonly input!: HTMLInputElement

		get template() {
			return html`<input ?required=${this.required} ${this.binder.bind('value')}>`
		}
	}

	const fixtureAppliedRequiredConflict = new ComponentTestFixture<TestBindingIntegrationConflict>(html`
		<test-binding-integration-conflict ?required=${false} .data=${{ integrate: true, required: true, value: 'test' }}></test-binding-integration-conflict>
	`)

	const fixtureAppliedNotRequiredConflict = new ComponentTestFixture<TestBindingIntegrationConflict>(html`
		<test-binding-integration-conflict ?required=${true} .data=${{ integrate: true, required: false, value: 'test' }}></test-binding-integration-conflict>
	`)

	it('should prefer the integration over the property when condition is met', () => {
		expect(fixtureAppliedRequiredConflict.component.input.required).toBe(true)
		expect(fixtureAppliedNotRequiredConflict.component.input.required).toBe(false)
	})

	const fixtureNotAppliedRequiredConflict = new ComponentTestFixture<TestBindingIntegrationConflict>(html`
		<test-binding-integration-conflict ?required=${false} .data=${{ integrate: false, required: true, value: 'test' }}></test-binding-integration-conflict>
	`)

	const fixtureNotAppliedNotRequiredConflict = new ComponentTestFixture<TestBindingIntegrationConflict>(html`
		<test-binding-integration-conflict ?required=${true} .data=${{ integrate: false, required: false, value: 'test' }}></test-binding-integration-conflict>
	`)

	it('should prefer the property over the integration when condition is not met', () => {
		expect(fixtureNotAppliedRequiredConflict.component.input.required).toBe(false)
		expect(fixtureNotAppliedNotRequiredConflict.component.input.required).toBe(true)
	})


	/**
	 * Copies a label off the bound source onto the target, which is what a design-system integration does:
	 * it decorates the *target* and never touches the source.
	 *
	 * Scoped to elements carrying "data-integrate-label" so that it cannot disturb any other spec.
	 */
	@bindingIntegration()
	class LabelBindingIntegration extends BindingIntegration {
		bind({ source, element }: ValueBinder) {
			if (element.hasAttribute('data-integrate-label') && source?.label) {
				element.setAttribute('data-label', source.label)
			}
		}
	}

	LabelBindingIntegration

	type Source = { readonly label: string, readonly value: string }

	/** Its "value" is a plain field, so binding to it is two-way. */
	class WritableSource implements Source {
		label = 'writable label'
		value = 'writable value'
	}

	/** Its "value" is a getter without a setter, so binding to it is one-way. */
	class ReadOnlySource implements Source {
		label = 'read-only label'
		get value() { return 'read-only value' }
	}

	describe('mode', () => {
		@component('test-binding-integration-mode')
		class TestBindingIntegrationMode extends Component {
			@property({ type: Object }) source: Source = new WritableSource
			@property({ type: Boolean }) forceTwoWay = false

			private readonly binder = new Binder<Source>(this, 'source')

			@query('input') readonly input!: HTMLInputElement

			get template() {
				return html`
					<input data-integrate-label ${this.forceTwoWay
						? this.binder.bind({ keyPath: 'value', mode: BindingMode.TwoWay })
						: this.binder.bind('value')}>
			`
			}
		}

		const fixtureOf = (source: Source, forceTwoWay = false) => new ComponentTestFixture<TestBindingIntegrationMode>(html`
			<test-binding-integration-mode .source=${source} ?forceTwoWay=${forceTwoWay}></test-binding-integration-mode>
		`)

		describe('with a writable source', () => {
			const fixture = fixtureOf(new WritableSource)

			it('should bind the value', () => {
				expect(fixture.component.input.value).toBe('writable value')
			})

			it('should run the integration', () => {
				expect(fixture.component.input.getAttribute('data-label')).toBe('writable label')
			})
		})

		/**
		 * A read-only source makes the binding one-way, which is only a statement about the direction the
		 * *value* travels. The integration decorates the target either way, so it has to run either way.
		 */
		describe('with a read-only source', () => {
			const fixture = fixtureOf(new ReadOnlySource)

			it('should bind the value', () => {
				expect(fixture.component.input.value).toBe('read-only value')
			})

			it('should run the integration', () => {
				expect(fixture.component.input.getAttribute('data-label')).toBe('read-only label')
			})
		})

		/** Forcing the mode is what isolates the direction as the cause: nothing else about this binding differs. */
		describe('with a read-only source bound two-way explicitly', () => {
			const fixture = fixtureOf(new ReadOnlySource, true)

			it('should bind the value', () => {
				expect(fixture.component.input.value).toBe('read-only value')
			})

			it('should run the integration', () => {
				expect(fixture.component.input.getAttribute('data-label')).toBe('read-only label')
			})

			it('should leave the read-only source untouched', () => {
				expect(fixture.component.source.value).toBe('read-only value')
			})
		})
	})
})