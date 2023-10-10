import { StyleEntry, styleHandler, StyleHandler } from './style.js'

@styleHandler()
export class CustomPropertyStyleHandler implements StyleHandler {
	handles(_: HTMLElement, [key]: StyleEntry) {
		return key.startsWith('--')
	}

	apply(element: HTMLElement, [key, value]: StyleEntry) {
		element.style.setProperty(key, value)
	}
}