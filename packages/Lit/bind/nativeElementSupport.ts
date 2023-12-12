import { isServer } from 'lit'
import { bindingDefaultPropertyKey } from './bindingDefaultProperty.js'

if (isServer === false) {
	const key = bindingDefaultPropertyKey;
	(HTMLInputElement as any)[key] = (HTMLTextAreaElement as any)[key] = (HTMLSelectElement as any)[key] = (HTMLProgressElement as any)[key] = 'value'
}