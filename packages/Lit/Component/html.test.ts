import { nothing } from 'lit'
import { html } from './html.js'

describe('html', () => {
	it('should have a nothing property', () => {
		expect(html.nothing).toBe(nothing as any)
	})
})