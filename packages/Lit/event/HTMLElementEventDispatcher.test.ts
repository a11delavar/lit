import { HTMLElementEventDispatcher } from './HTMLElementEventDispatcher.js'

describe(HTMLElementEventDispatcher.name, () => {
	const div = document.createElement('div')

	it('should dispatch custom event with given detail', () => {
		const handler = vi.fn()

		div.addEventListener<any>('test', (e: CustomEvent<string>) => handler(e.constructor.name, e.detail))
		new HTMLElementEventDispatcher<string>(div, 'test').dispatch('test')

		expect(handler).toHaveBeenCalledExactlyOnceWith(CustomEvent.name, 'test')
	})

	it('should dispatch event with options', () => {
		const handler = vi.fn()

		div.addEventListener<any>('test', (e: CustomEvent<string>) => handler(e.detail, e.bubbles))
		new HTMLElementEventDispatcher<string>(div, 'test', { bubbles: true }).dispatch('test')

		expect(handler).toHaveBeenCalledExactlyOnceWith('test', true)
	})

	it('should be able to dispatch custom event', () => {
		const handler = vi.fn()
		class SpecialEvent extends CustomEvent<string> {
			constructor() {
				super('special', { bubbles: true, cancelable: true, detail: 'special' })
			}
		}

		div.addEventListener<any>('special', (e: SpecialEvent) => handler(e.constructor.name, e.detail))
		new HTMLElementEventDispatcher<string>(div, 'special').dispatch(new SpecialEvent())
		expect(handler).toHaveBeenCalledExactlyOnceWith(SpecialEvent.name, 'special')
	})

	it('should subscribe to event', () => {
		const handler = vi.fn()

		new HTMLElementEventDispatcher<string>(div, 'test').subscribe(handler)
		div.dispatchEvent(new CustomEvent('test', { detail: 'test' }))

		expect(handler).toHaveBeenCalledExactlyOnceWith('test')
	})

	it('should unsubscribe from event', () => {
		const handler = vi.fn()

		const dispatcher = new HTMLElementEventDispatcher<string>(div, 'test')
		dispatcher.subscribe(handler)
		dispatcher.unsubscribe(handler)
		div.dispatchEvent(new CustomEvent('test', { detail: 'test' }))

		expect(handler).not.toHaveBeenCalled()
	})

	it('should subscribe to an event only once', () => {
		const handler = vi.fn()

		const dispatcher = new HTMLElementEventDispatcher<string>(div, 'test')
		dispatcher.subscribe(handler)
		dispatcher.subscribe(handler)
		div.dispatchEvent(new CustomEvent('test', { detail: 'test' }))

		expect(handler).toHaveBeenCalledExactlyOnceWith('test')
	})
})
