import { AsyncDirective, directive, noChange, PartType, type ElementPart, type PartInfo } from '../index.js'

/** What {@link elementRefDirective} fills. */
export interface ElementRefTarget {
	set(element: Element, options: unknown): void
	delete(element: Element): boolean
}

class ElementRefDirective extends AsyncDirective {
	// Public: the class appears in the emitted declaration.
	target?: ElementRefTarget
	element?: Element
	options?: unknown

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('This directive can only be used on an element')
		}
	}

	render(target: ElementRefTarget, options: unknown) {
		target
		options
		return noChange
	}

	override update(part: ElementPart, [target, options]: [ElementRefTarget, unknown]) {
		// A part re-rendered with another reference leaves the previous one.
		if (this.target !== undefined && this.target !== target) {
			this.target.delete(this.element!)
		}
		this.target = target
		this.element = part.element
		this.options = options
		target.set(part.element, options)
		return this.render(target, options)
	}

	override disconnected() {
		this.target!.delete(this.element!)
	}

	override reconnected() {
		this.target!.set(this.element!, this.options)
	}
}

/** One class for every reference, as lit identifies a directive by its class. */
export const elementRefDirective = directive(ElementRefDirective)