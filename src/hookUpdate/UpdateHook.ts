import { Component, ReactiveElement } from '../index.js'

export class UpdateHook {
	readonly propertyKeys = new Set<PropertyKey>()

	constructor(readonly host: Component) { }

	async getUpdateComplete() {
		const results = await Promise.all(
			[...this.propertyKeys]
				.map(propertyKey => this.getUpdateCompleteOf((this as any)[propertyKey])))
		return results.every(result => result === true)
	}

	private getUpdateCompleteOf(element: unknown) {
		return element instanceof ReactiveElement
			? element.updateComplete
			: Promise.resolve(true)
	}

	async update() {
		await Promise.all(
			[...this.propertyKeys]
				.map(propertyKey => this.updateOf((this as any)[propertyKey]))
		)
	}

	private updateOf(element: unknown) {
		return element instanceof ReactiveElement
			? element.requestUpdate()
			: Promise.resolve()
	}
}