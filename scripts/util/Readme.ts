import FileSystem from 'fs'
import Path from 'path'
import { code, summary, table } from './Markdown.ts'
import { ModuleExports } from './ModuleExports.ts'
import { Package } from './Package.ts'

/** A directory of a package with a README of its own, documenting one feature. */
export interface Feature {
	readonly directory: string
	readonly readmePath: string
	readonly title: string
	readonly summary: string
	readonly sourceUrl: string
}

/**
 * The READMEs are written by hand, except for the root one, which lists the packages, and two sections of each
 * package's, which list what the package consists of and are regenerated between their markers:
 * - `<!-- features -->`: the feature READMEs in the package's subdirectories, in the order its index exports them.
 * - `<!-- exports -->`: the named exports of its index, with the first sentence of their JSDoc.
 */
export class Readme {
	static readonly sections = ['features', 'exports'] as const

	static read(path: string) {
		return FileSystem.readFileSync(path, 'utf8').replace(/\r\n?/g, '\n')
	}

	/** The features of a package, in the order its index exports their directories. */
	static featuresOf(p: Package) {
		const index = !p.entry ? '' : Readme.read(p.entry)
		const directories = [...new Set([...index.matchAll(/^export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+'\.\/([\w.-]+)\/index\.js'/gm)].map(match => match[1]!))]
		return directories
			.map(directory => ({ directory, readmePath: Path.join(p.path, directory, 'README.md') }))
			.filter(({ readmePath }) => FileSystem.existsSync(readmePath))
			.map(({ directory, readmePath }): Feature => {
				const [heading = '', ...body] = Readme.read(readmePath).split('\n')
				return {
					directory,
					readmePath,
					title: heading.replace(/^#\s+/, '').trim(),
					summary: summary(body.join('\n').trim()),
					sourceUrl: `${p.sourceUrl}/${directory}`,
				}
			})
	}

	/** Writes the root README and the generated sections of every package's. */
	static async generate() {
		await FileSystem.promises.writeFile('README.md', `${Readme.root()}\n`)
		await Promise.all(Package.all.map(async p => {
			const path = Path.join(p.path, 'README.md')
			if (FileSystem.existsSync(path)) {
				await FileSystem.promises.writeFile(path, `${Readme.of(p, Readme.read(path))}\n`)
			}
		}))
	}

	private static root() {
		const style = 'for-the-badge'
		const rows = Package.all.map(p => {
			const encoded = encodeURIComponent(p.name)
			const npm = `https://www.npmjs.com/package/${p.name}`
			return [
				`[${p.directoryName}](${p.relativePath})`,
				`[![](https://img.shields.io/badge/${encoded.replace(/-/g, '--')}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](${npm})`,
				`[![](https://img.shields.io/npm/v/${encoded}?style=${style}&label=)](${npm})`,
				`[![](https://img.shields.io/npm/dm/${encoded}?style=${style}&label=&color=blue)](${npm})`,
			]
		})
		return [
			'<div align="center">\n<h3>Libraries</h3>',
			`[![Tests](https://img.shields.io/github/actions/workflow/status/a11delavar/lit/development.yml?logo=github&style=${style}&label=Tests)](${Package.repositoryUrl}/actions/workflows/development.yml)\n`
			+ `[![llms.txt](https://img.shields.io/badge/-llms.txt-8A2BE2?style=${style})](${Package.pagesUrl}llms.txt)`,
			table(['Module', 'Package', 'Version', 'Downloads'], rows),
			'</div>',
		].join('\n\n')
	}

	/** A package's README with its generated sections regenerated, appending those it does not place yet. */
	private static of(p: Package, text: string) {
		const blocks = { features: Readme.features(p), exports: Readme.exports(p) }
		let result = text.trimEnd()
		for (const section of Readme.sections) {
			const marked = `<!-- ${section} -->\n${blocks[section]}${!blocks[section] ? '' : '\n'}<!-- /${section} -->`
			const pattern = new RegExp(`<!-- ${section} -->[\\s\\S]*?<!-- /${section} -->`)
			result = pattern.test(result) ? result.replace(pattern, () => marked)
				: !blocks[section] ? result
					: `${result}\n\n${marked}`
		}
		return result
	}

	private static features(p: Package) {
		const features = Readme.featuresOf(p)
		return !features.length ? '' : [
			'## Features',
			features.map(feature => `- **[${feature.title}](${feature.sourceUrl})**${!feature.summary ? '' : ` - ${feature.summary}`}`).join('\n'),
		].join('\n\n')
	}

	private static exports(p: Package) {
		// Undocumented types are mostly the options of what is listed anyway:
		const exports = (!p.entry ? [] : ModuleExports.of(p.entry))
			.map(entry => ({ ...entry, summary: !entry.description ? '' : summary(entry.description) }))
			.filter(entry => !entry.typeOnly || entry.summary)
		return !exports.length ? '' : [
			'## Exports',
			table(['Name', 'Kind', 'Description?'], exports.map(entry => [code(entry.name), entry.kind, entry.summary])),
		].join('\n\n')
	}
}
