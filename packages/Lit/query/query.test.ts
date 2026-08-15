import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, Controller, html } from '../index.js'
import { query } from './query.js'
import { queryAll } from './queryAll.js'

class QueryTestController extends Controller {
	@query('#single') readonly singleElement!: HTMLSpanElement | undefined
	@query('#missing') readonly missingElement!: HTMLSpanElement | undefined
	@queryAll('.multiple') readonly multipleElements!: Array<HTMLSpanElement>

	constructor(override readonly host: QueryTestComponent) {
		super(host)
	}
}

@component('lit-test-query')
class QueryTestComponent extends Component {
	@query('#single') readonly singleElement!: HTMLSpanElement | undefined
	@queryAll('.multiple') readonly multipleElements!: Array<HTMLSpanElement>

	readonly controller = new QueryTestController(this)

	protected override get template() {
		return html`
			<span id='single'></span>
			<span class='multiple'></span>
			<span class='multiple'></span>
		`
	}
}

describe('query', () => {
	const fixture = new ComponentTestFixture(() => new QueryTestComponent())

	describe('on a Component', () => {
		it('should query the render root of the component', () => {
			expect(fixture.component.singleElement).toBe(fixture.component.renderRoot.querySelector('#single') as HTMLSpanElement)
		})

		it('should query all matching elements', () => {
			expect(fixture.component.multipleElements.length).toBe(2)
		})
	})

	describe('on a Controller', () => {
		it('should query the render root of the host', () => {
			expect(fixture.component.controller.singleElement).toBe(fixture.component.renderRoot.querySelector('#single') as HTMLSpanElement)
		})

		it('should query all matching elements of the render root of the host', () => {
			expect(fixture.component.controller.multipleElements).toEqual(fixture.component.multipleElements)
			expect(fixture.component.controller.multipleElements.length).toBe(2)
		})

		it('should return undefined when no element matches', () => {
			expect(fixture.component.controller.missingElement).toBeUndefined()
		})
	})
})