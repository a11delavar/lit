import '@lit-labs/ssr-client/lit-element-hydrate-support.js'
import { digestForTemplateResult, hydrate } from '@lit-labs/ssr-client'
import { Directive, directive, html, noChange, nothing, render } from '../index.js'

describe('hydrateAttributes', () => {
	const keep = directive(class extends Directive {
		render() {
			return noChange
		}
	})

	const template = (title: unknown, hidden: boolean, name: unknown = title) => html`<div title=${title} ?hidden=${hidden} class='a ${name}'></div>`

	let container: HTMLDivElement
	let div: HTMLDivElement

	/** The server's render of the template, with the attributes it gave the element. */
	const renderOnServer = (attributes: string) => {
		container = document.createElement('div')
		container.innerHTML = `<!--lit-part ${digestForTemplateResult(template('', false))}--><!--lit-node 0--><div ${attributes}></div><!--/lit-part-->`
		document.body.append(container)
		div = container.querySelector('div')!
	}

	afterEach(() => container.remove())

	it('should write the attributes the browser renders differently', () => {
		renderOnServer('title="server" class="a server"')
		hydrate(template('browser', true), container)
		expect(div.getAttribute('title')).toBe('browser')
		expect(div.getAttribute('class')).toBe('a browser')
		expect(div.hidden).toBe(true)
	})

	it('should remove the attributes the browser does not render', () => {
		renderOnServer('title="server" hidden class="a server"')
		hydrate(template('server', false, nothing), container)
		expect(div.hidden).toBe(false)
		expect(div.hasAttribute('class')).toBe(false)
	})

	it('should keep the attribute the browser binds nothing to, which the element may reflect itself', () => {
		renderOnServer('title="reflected" class="a server"')
		hydrate(template(nothing, false, 'server'), container)
		expect(div.getAttribute('title')).toBe('reflected')
	})

	it('should not write the attributes the browser renders alike', () => {
		renderOnServer('title="same" class="a same"')
		const setAttribute = vi.spyOn(div, 'setAttribute')
		hydrate(template('same', false), container)
		expect(setAttribute).not.toHaveBeenCalled()
		expect(div.getAttribute('title')).toBe('same')
	})

	it('should keep the attribute a directive leaves unchanged', () => {
		renderOnServer('title="server" class="a server"')
		hydrate(template(keep(), false, 'server'), container)
		expect(div.getAttribute('title')).toBe('server')
	})

	it('should render the next values as usual', () => {
		renderOnServer('title="server" class="a server"')
		hydrate(template('browser', true), container)
		render(template('later', false), container)
		expect(div.getAttribute('title')).toBe('later')
		expect(div.getAttribute('class')).toBe('a later')
		expect(div.hidden).toBe(false)
	})
})
