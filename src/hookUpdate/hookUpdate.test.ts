import { html } from 'lit'
import { Component } from '../Component/index.js'
import { ComponentTestFixture } from '../test/ComponentTestFixture.js'

class HookUpdateTestComponent extends Component {
	override get template() {
		return html``
	}
}
customElements.define('hook-update-test-component', HookUpdateTestComponent)

describe('hookUpdate', () => {
	const fixture = new ComponentTestFixture<HookUpdateTestComponent>('hook-update-test-component')

	it('...', () => {
		fixture
	})
})