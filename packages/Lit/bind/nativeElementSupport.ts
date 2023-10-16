import { bindingDefaultPropertyKey } from './bindingDefaultProperty.js'

const key = bindingDefaultPropertyKey;
(HTMLInputElement as any)[key] = (HTMLTextAreaElement as any)[key] = (HTMLSelectElement as any)[key] = (HTMLProgressElement as any)[key] = 'value'