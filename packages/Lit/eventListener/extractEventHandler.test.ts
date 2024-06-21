import { Component, component, html } from '../Component'
import { ComponentTestFixture } from '@a11d/lit-testing'
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