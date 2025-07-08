import { ComponentTestFixture } from '@a11d/lit-testing'
import { query } from '../query'
import { Component, html, component } from '../Component'
import { Binder } from './Binder'
import { bindingIntegration, BindingIntegration } from './BindingIntegration'
import { type ValueBinder } from './ValueBinder'
import { property } from '..'

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
})