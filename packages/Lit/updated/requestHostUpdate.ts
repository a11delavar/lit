import { ReactiveElement } from 'lit'
import { host, type HostProvider } from '../host.js'
import { getChangedPropertyKey } from './getChangedPropertyKey.js'

const alwaysChanged = { hasChanged: () => true }

/**
 * Requests an update of the host of the given context.
 *
 * When a property key is provided, the change is tracked in the host's `changedProperties`
 * by the key resolved through `getChangedPropertyKey`. As a property of a context other than
 * the host itself does not exist on the host, its change has to be flagged explicitly.
 */
export const requestHostUpdate = (context: HostProvider, propertyKey?: PropertyKey, oldValue?: unknown) => {
	const element = context[host]

	if (propertyKey === undefined) {
		element?.requestUpdate()
		return
	}

	element?.requestUpdate(
		getChangedPropertyKey(context, propertyKey),
		oldValue,
		context instanceof ReactiveElement ? undefined : alwaysChanged,
	)
}