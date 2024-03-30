import { extractEventTargets } from './extractEventTargets.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

describe('extractEventTargets', () => {
	const fixture = new ComponentTestFixture('div')

	it('should return the host if no target is provided', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, undefined)
		expect(result).toEqual([host])
	})

	it('should return the host if the target is the host', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, host)
		expect(result).toEqual([host])
	})

	it('should return the target if the target is a global EventTarget', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, window)
		expect(result).toEqual([window])
	})

	it('should return the targetsif the target is an array of global EventTargets', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, [window, document])
		expect(result).toEqual([window, document])
	})

	it('should return the host if the target is a function that returns the host', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, () => host)
		expect(result).toEqual([host])
	})

	it('should return the host if the target is a function that returns a promise that resolves to the host', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, () => Promise.resolve(host))
		expect(result).toEqual([host])
	})

	it('should return the host if the target is a function that returns an array containing the host', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, () => [host])
		expect(result).toEqual([host])
	})

	it('should return the host if the target is a function that returns a promise that resolves to an array containing the host', async () => {
		const host = fixture.component
		const result = await extractEventTargets(host, () => Promise.resolve([host]))
		expect(result).toEqual([host])
	})

	it('should return the host if the target is a function that returns an array containing the host and another EventTarget', async () => {
		const host = fixture.component
		const target = document.createElement('div')
		host.appendChild(target)
		const result = await extractEventTargets(host, function (this: any) { return [this, this.querySelector('div')] })
		expect(result).toEqual([host, target])
	})
})