import { type HTMLTemplateResult, nothing as litNothing, html as litHtml } from 'lit'

function html(...args: Parameters<typeof litHtml>): HTMLTemplateResult {
	return litHtml(...args)
}

html.nothing = litNothing as unknown as HTMLTemplateResult

export { html }