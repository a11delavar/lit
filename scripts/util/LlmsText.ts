import FileSystem from 'fs'
import Path from 'path'
import { Package } from './Package.ts'
import { Readme } from './Readme.ts'

interface Page {
	readonly title: string
	/** The Markdown file, relative to the site. */
	readonly path: string
	readonly url: string
	readonly summary: string
	/** The heading the page is listed under in `llms.txt`. */
	readonly section: string
	/** Whether a reader short of context skips the page, such as a changelog. */
	readonly optional: boolean
	/** The file the page is made of, and the web address it is linked by from the READMEs, if any. */
	readonly source: string
	readonly sourceUrl?: string
}

/**
 * What a language model reads of the libraries, published on the documentation site: every README and changelog as a
 * Markdown page, "llms.txt" listing them as https://llmstxt.org describes, and "llms-full.txt" holding every page but
 * the optional ones in one file.
 */
export class LlmsText {
	/** The files by their paths relative to the site. Changelogs are included where they have been generated. */
	static files() {
		const pages = LlmsText.pages()
		const header = [
			'# @a11d',
			'> Libraries for building web components with Lit: `@a11d/lit`, a thin layer over Lit with additional lifecycle hooks, decorators and directives, and the type-safe utilities it is built on.',
			'Every package is published to npm as `@a11d/<name>` and ships its README and changelog. Each page here is the README of a package, or of a feature of one, as Markdown.',
		]
		const listed = pages.filter(page => !page.optional)
		const link = (page: Page) => `- [${page.title}](${page.url})${!page.summary ? '' : `: ${page.summary}`}`
		const llms = [
			...header,
			`[llms-full.txt](${Package.pagesUrl}llms-full.txt) holds every page but the optional ones in one file.`,
			...[...new Set(listed.map(page => page.section))].flatMap(section => [`## ${section}`, listed.filter(page => page.section === section).map(link).join('\n')]),
			...!pages.some(page => page.optional) ? [] : ['## Optional', pages.filter(page => page.optional).map(link).join('\n')],
		]
		const markdown = (page: Page) => LlmsText.markdown(page, pages)
		return new Map([
			...pages.map(page => [page.path, markdown(page)] as const),
			['llms.txt', llms.join('\n\n')],
			['llms-full.txt', [...header, ...listed.map(markdown)].join('\n\n')],
		])
	}

	private static pages() {
		const page = (init: Omit<Page, 'url'>): Page => ({ ...init, url: `${Package.pagesUrl}${init.path}` })
		const packages = Package.all.filter(p => FileSystem.existsSync(Path.join(p.path, 'README.md')))
		return [
			...packages.map(p => page({
				title: p.name,
				path: `docs/${p.directoryName}.md`,
				summary: p.packageJson.description,
				section: 'Packages',
				optional: false,
				source: Path.join(p.path, 'README.md'),
				sourceUrl: p.sourceUrl,
			})),
			...packages.flatMap(p => Readme.featuresOf(p).map(feature => page({
				title: feature.title,
				path: `docs/${p.directoryName}/${feature.directory}.md`,
				summary: feature.summary,
				section: p.name,
				optional: false,
				source: feature.readmePath,
				sourceUrl: feature.sourceUrl,
			}))),
			...packages
				.map(p => ({ p, source: Path.join(p.path, 'CHANGELOG.md') }))
				.filter(({ source }) => FileSystem.existsSync(source) && !!Readme.read(source).trim())
				.map(({ p, source }) => page({
					title: `${p.name} changelog`,
					path: `docs/${p.directoryName}/CHANGELOG.md`,
					summary: `Every published version of \`${p.name}\` with its changes, newest first.`,
					section: 'Optional',
					optional: true,
					source,
				})),
		]
	}

	/** The page's file without the markers of generated sections, its links to other pages pointing at their Markdown. */
	private static markdown(page: Page, pages: ReadonlyArray<Page>) {
		let text = Readme.read(page.source).replace(/^<!-- \/?[\w-]+ -->\n?/gm, '')
		for (const other of pages) {
			if (other.sourceUrl) {
				const escaped = other.sourceUrl.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
				text = text.replace(new RegExp(`\\]\\(${escaped}/?(?:#readme)?\\)`, 'g'), `](${other.url})`)
			}
		}
		return text.replace(/\n{3,}/g, '\n\n').trim()
	}
}