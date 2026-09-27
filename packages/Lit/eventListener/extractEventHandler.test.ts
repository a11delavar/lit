import { Component, component, html } from '../Component'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PartType } from 'lit/async-directive.js'
import { extractEventHandler } from './extractEventHandler'

describe('extractEventHandler', () => {
	@component('test-extract-event-handler')
	class TestExtractEventHandlerComponent extends Component {
		readonly eventListeners = new Map<string, Set<EventListenerOrEventListenerObject>>()

		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void {
			const listeners = this.eventListeners.get(type) ?? new Set()
			listeners.add(listener)
			this.eventListeners.set(type, listeners)
			super.addEventListener(type, listener, options)
		}

		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void {
			this.eventListeners.get(type)?.delete(listener)
			super.removeEventListener(type, listener, options)
		}
	}

	describe('when event listener is a lit event-part function', () => {
		const clickHandler = jasmine.createSpy('clickHandler') as (e: Event) => void

		const fixture = new ComponentTestFixture<TestExtractEventHandlerComponent>(html`
			<test-extract-event-handler @click=${clickHandler}></test-extract-event-handler>
		`)

		it('should extract function handler', () => {
			const eventListener = fixture.component.eventListeners.get('click')?.values().next().value

			const handler = extractEventHandler(eventListener)

			// console.log(eventListener)

			expect(handler).not.toBe(clickHandler) // Because the handler is bound to the element
			handler(new MouseEvent('click'))

			expect(clickHandler).toHaveBeenCalledOnceWith(jasmine.any(MouseEvent))
		})
	})

	describe('when event listener is a lit event-part function returning a value', () => {
		const pending = Promise.resolve('saved')

		const fixture = new ComponentTestFixture<TestExtractEventHandlerComponent>(html`
			<test-extract-event-handler @click=${() => pending}></test-extract-event-handler>
		`)

		it('should pass on what the bound function returns', () => {
			const eventListener = fixture.component.eventListeners.get('click')!.values().next().value!

			expect(extractEventHandler(eventListener)(new MouseEvent('click'))).toBe(pending)
		})
	})

	// Lit's development build keeps `_$committedValue`, which its production build minifies to `_$AH`:
	for (const property of ['_$committedValue', '_$AH']) {
		describe(`when event listener is an event part holding its listener as "${property}"`, () => {
			const element = document.createElement('div')

			it('should run the listener bound to the element and pass on its result', () => {
				const listener = jasmine.createSpy('listener').and.callFake(function (this: unknown) { return this })

				const handler = extractEventHandler({ type: PartType.EVENT, element, [property]: listener } as unknown as EventListenerObject)

				expect(handler(new MouseEvent('click'))).toBe(element)
				expect(listener).toHaveBeenCalledOnceWith(jasmine.any(MouseEvent))
			})

			it('should bind the listener to the host of the template where there is one', () => {
				const host = {}
				const listener = function (this: unknown) { return this }

				const handler = extractEventHandler({ type: PartType.EVENT, element, options: { host }, [property]: listener } as unknown as EventListenerObject)

				expect(handler(new MouseEvent('click'))).toBe(host)
			})

			it('should run the handleEvent of a listener object', () => {
				const listener = { handleEvent: jasmine.createSpy('handleEvent').and.returnValue('handled') }

				const handler = extractEventHandler({ type: PartType.EVENT, element, [property]: listener } as unknown as EventListenerObject)

				expect(handler(new MouseEvent('click'))).toBe('handled')
				expect(listener.handleEvent).toHaveBeenCalledOnceWith(jasmine.any(MouseEvent))
			})
		})
	}

	describe('when event listener is an object with handleEvent method', () => {
		const clickHandler = { handleEvent: jasmine.createSpy('clickHandler') }

		const fixture = new ComponentTestFixture<TestExtractEventHandlerComponent>(html`
			<test-extract-event-handler></test-extract-event-handler>
		`)

		it('should extract handleEvent method', () => {
			fixture.component.addEventListener('click', clickHandler)
			const eventListener = fixture.component.eventListeners.get('click')?.values().next().value

			const handler = extractEventHandler(eventListener)

			expect(handler).toBe(clickHandler.handleEvent)
		})
	})

	describe('when event listener is a function', () => {
		const clickHandler = jasmine.createSpy('clickHandler') as (e: Event) => void

		const fixture = new ComponentTestFixture<TestExtractEventHandlerComponent>(html`
			<test-extract-event-handler></test-extract-event-handler>
		`)

		it('should extract function handler', () => {
			fixture.component.addEventListener('click', clickHandler)
			const eventListener = fixture.component.eventListeners.get('click')?.values().next().value

			const handler = extractEventHandler(eventListener)

			expect(handler).toBe(clickHandler)
		})
	})
})