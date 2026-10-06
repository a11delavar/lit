/** Resolves JSDoc's inline `{@link}` tags, which Markdown would print as they are. */
export function links(text: string) {
	return text.replace(/\{@link(?:code|plain)?\s+([^\s|}]+)(?:\s*\|\s*|\s+)?([^}]*)\}/g, (_, target: string, label: string) => label.trim() || `\`${target}\``)
}

/** A text for one table cell or list item. */
export function inline(text: string) {
	return links(text).replace(/\s+/g, ' ').trim()
}

/** The first sentence of a text's first paragraph, which a text opening with a list or a code block does not have. */
export function summary(text: string) {
	const paragraph = links(text.replace(/\r\n?/g, '\n')).split(/\n\s*\n|\n(?=\s*(?:[-*+]|\d+\.)\s)/)[0] ?? ''
	const flat = /^\s*(?:[-*+]\s|\d+\.\s|`{3})/.test(paragraph) ? '' : paragraph.replace(/\s+/g, ' ').trim()
	let code = false
	for (let index = 0; index < flat.length; index++) {
		const char = flat[index]!
		if (char === '`') {
			code = !code
		} else if (!code && '.!?'.includes(char) && (index === flat.length - 1 || flat[index + 1] === ' ' && !/[a-z]/.test(flat[index + 2] ?? ''))) {
			return inline(flat.slice(0, index + 1))
		}
	}
	return inline(flat.replace(/:$/, '.'))
}

export function code(text: string) {
	const value = text.replace(/\s+/g, ' ').trim()
	const fence = '`'.repeat(Math.max(0, ...[...value.matchAll(/`+/g)].map(match => match[0].length)) + 1)
	return fence.length > 1 ? `${fence} ${value} ${fence}` : `${fence}${value}${fence}`
}

/** A table whose columns marked with a trailing `?` are left out when none of the rows has a value for them. */
export function table(columns: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string>>) {
	if (!rows.length) {
		return ''
	}
	const kept = columns.flatMap((column, index) => !column.endsWith('?') || rows.some(row => !!row[index]) ? [index] : [])
	const line = (cells: ReadonlyArray<string>) => `| ${cells.map(cell => cell.replace(/\|/g, '\\|')).join(' | ')} |`
	return [
		line(kept.map(index => columns[index]!.replace(/\?$/, ''))),
		line(kept.map(() => '---')),
		...rows.map(row => line(kept.map(index => row[index] ?? ''))),
	].join('\n')
}
