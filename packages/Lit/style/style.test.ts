import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, html } from '../Component'
import { query } from '../query'
import { style } from './style'
import { state } from 'lit/decorators.js'

@component('test-style-directive')
class TestStyleDirective extends Component {
	@query('div') readonly target!: HTMLDivElement

	@state() declaration: Parameters<typeof style>[0] = {}

	get template() {
		return html`<div ${style(this.declaration)}></div>`
	}
}

describe('style', () => {
	const fixture = new ComponentTestFixture(() => new TestStyleDirective())

	it('should not update style if declaration is empty', async () => {
		fixture.component.declaration = {}

		await fixture.updateComplete

		expect(fixture.component.target.style.length).toBe(0)
	})

	describe('standard properties', () => {
		for (const { value, expected } of [
			{ value: null, expected: '' },
			{ value: undefined, expected: '' },
			{ value: 'red', expected: 'red' }
		]) {
			it(`should handle setting value ${value}`, async () => {
				fixture.component.declaration = { color: value as any }

				await fixture.updateComplete

				expect(fixture.component.target.style.color).toBe(expected)
			})

			it('should handle updating value', async () => {
				fixture.component.declaration = { color: 'red' }

				await fixture.updateComplete

				fixture.component.declaration = { color: value as any }

				await fixture.updateComplete

				expect(fixture.component.target.style.color).toBe(expected)
			})

			it('should handle removing value', async () => {
				fixture.component.declaration = { color: value as any }

				await fixture.updateComplete

				expect(fixture.component.target.style.color).toBe(expected)

				fixture.component.declaration = {}

				await fixture.updateComplete

				expect(fixture.component.target.style.color).toBe('')
			})
		}
	})

	describe('custom properties', () => {
		it('should handle custom properties', async () => {
			fixture.component.declaration = { '--custom': 'value' }

			await fixture.updateComplete

			expect(fixture.component.target.style.getPropertyValue('--custom')).toBe('value')
		})
	})
})