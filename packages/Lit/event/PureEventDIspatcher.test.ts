import { PureEventDispatcher } from './PureEventDispatcher.js'

describe(PureEventDispatcher.name, () => {
	it('should subscribe to event', () => {
		const handler = jasmine.createSpy()

		const dispatcher = new PureEventDispatcher<string>()
		dispatcher.subscribe(handler)
		dispatcher.dispatch('test')

		expect(handler).toHaveBeenCalledOnceWith('test')
	})

	it('should unsubscribe from event', () => {
		const handler = jasmine.createSpy()

		const dispatcher = new PureEventDispatcher<string>()
		dispatcher.subscribe(handler)
		dispatcher.unsubscribe(handler)
		dispatcher.dispatch('test')

		expect(handler).not.toHaveBeenCalled()
	})

	it('should subscribe to an event only once', () => {
		const handler = jasmine.createSpy()

		const dispatcher = new PureEventDispatcher<string>()
		dispatcher.subscribe(handler)
		dispatcher.subscribe(handler)
		dispatcher.dispatch('test')

		expect(handler).toHaveBeenCalledOnceWith('test')
	})
})