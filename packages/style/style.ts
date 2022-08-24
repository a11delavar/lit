import { Directive, directive, ElementPart, PartInfo, PartType } from '..'
import type { StandardProperties } from 'csstype'

export type StyleEntry = [key: string, value: string]

export interface StyleHandler {
	handles(element: HTMLElement, entry: StyleEntry): boolean
	apply(element: HTMLElement, entry: StyleEntry): void
}

export const styleHandler = () => {
	return (Constructor: Constructor<StyleHandler>) => {
		const handler = new Constructor()
		StyleDirective.handlers.add(handler)
	}
}

export class StyleDirective extends Directive {
	static readonly handlers = new Set<StyleHandler>()

	private static readonly defaultHandler = new class implements StyleHandler {
		handles() { return true }
		apply(element: HTMLElement, [key, value]: StyleEntry): void {
			element.style[key as any] = value
		}
	}

	private readonly element: HTMLElement

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('observeMutation can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element as HTMLElement
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	render(styles: StandardProperties | (Record<string, string> & {})) {
		for (const [key, value] of Object.entries(styles)) {
			const handler = [...StyleDirective.handlers].find(handler => handler.handles(this.element, [key, value])) ?? StyleDirective.defaultHandler
			handler.apply(this.element, [key, value])
		}
	}
}

export const style = directive(StyleDirective)