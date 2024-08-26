import { Directive, directive, ElementPart, noChange, PartInfo, PartType } from '../index.js'
import type { StandardProperties } from 'csstype'

export type StyleEntry = [key: string, value: string]

type StyleDeclaration = StandardProperties | (Record<string, string> & {})

export class StyleDirective extends Directive {
	private readonly element: HTMLElement
	private previousStyle?: StyleDeclaration

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('style directive can only be used on an element')
		}

		const part = partInfo as ElementPart
		this.element = part.element as HTMLElement
	}

	render(styles: StyleDeclaration) {
		for (const k of [...Object.keys(styles), ...Object.keys(this.previousStyle ?? {})]) {
			const key = k as keyof StyleDeclaration

			const oldValue = this.previousStyle?.[key] as string | undefined
			const newValue = styles[key] as string | undefined

			if (oldValue === newValue) {
				continue
			}

			if (key.startsWith('--')) {
				this.element.style.setProperty(key, newValue ?? null)
			} else {
				this.element.style[key as any] = newValue === null || newValue === undefined ? '' : newValue
			}
		}

		this.previousStyle = structuredClone(styles)
		return noChange
	}
}

export const style = directive(StyleDirective)