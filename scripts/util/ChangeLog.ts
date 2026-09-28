import FileSystem from 'fs'
import Path from 'path'
import { Commit, type Change, type ChangeType } from '@3mo/commit-analyzer'
import { Package } from './Package.ts'
import { run } from './run.ts'

const typeInfo = new Map<ChangeType, { readonly emoji: string, readonly name: string }>([
	['feat', { emoji: '🚀', name: 'Feature' }],
	['fix', { emoji: '🐛', name: 'Fix' }],
	['chore', { emoji: '🧹', name: 'Chore' }],
	['refactor', { emoji: '🛠️', name: 'Refactoring' }],
	['test', { emoji: '🧪', name: 'Test' }],
	['docs', { emoji: '📝', name: 'Documentation' }],
	['perf', { emoji: '⚡️', name: 'Performance Improvement' }],
])

/** A version of a package with the commits that led to it, which are the ones changing its `package.json`. */
class Release {
	readonly package: Package
	readonly version: string
	readonly oldVersion: string | undefined
	readonly date: Date
	readonly commits = new Array<Commit>()

	constructor(p: Package, version: string, oldVersion: string | undefined, date: Date) {
		this.package = p
		this.version = version
		this.oldVersion = oldVersion
		this.date = date
	}

	toString() {
		const changes = this.commits.flatMap(commit => commit.changes
			.filter(change => change.scope === this.package.directoryName)
			.map(change => line(commit, change)))
		return !changes.length ? '' : `## ${this.version} (${this.date.toISOString().split('T')[0]})\n${changes.join('\n')}`
	}
}

function line(commit: Commit, change: Change) {
	const info = !change.type ? undefined : typeInfo.get(change.type)
	return `- **${info?.emoji ?? ''}${change.isBreaking ? '⚠️ Breaking ' : ' '}${info?.name ?? ''}**: ${change.heading} ([${commit.hash.slice(0, 7)}](${Package.repositoryUrl}/commit/${commit.hash}))`
}

/**
 * The changelog of every package, from the first-parent history of the checked-out commit: each commit that changes a
 * package's version starts a release, and its changes scoped to the package's directory name are the release's notes.
 */
export class ChangeLog {
	private static readonly versionRegex = /"version": \[-"(?<oldVersion>.+)",-]{\+"(?<version>.+)",\+}/
	/** The version a package was created with, from the commit that added its `package.json`. */
	private static readonly initialVersionRegex = /^new file mode [\s\S]*?\{\+\s*"version": "(?<version>[^"]+)",\+\}/m
	private static readonly commitRegex = /^(?=commit [0-9a-f]{40})/m
	private static readonly diffRegex = /^(?=diff --git )/m

	/** Writes the `CHANGELOG.md` of every package, which the release ships and the documentation shows. */
	static async generate() {
		const history = await ChangeLog.history()
		await Promise.all(Package.all.map(p => FileSystem.promises.writeFile(Path.join(p.path, 'CHANGELOG.md'), ChangeLog.of(p, history.get(p.relativePath) ?? []))))
	}

	/** The commits that changed each package's `package.json`, newest first, each as `git show` prints it for that file, by the package's current directory. */
	private static async history() {
		const log = await run('git log --first-parent -M --patch --unified=0 --word-diff=plain HEAD -- "packages/*/package.json"', { captureOutput: true })
		const history = new Map<string, Array<{ readonly message: string, readonly output: string }>>()
		// Renames are met newest first, before the commits that still name the old directory:
		const renames = new Map<string, string>()
		const current = (directory: string): string => renames.has(directory) ? current(renames.get(directory)!) : directory
		for (const entry of log.split(ChangeLog.commitRegex)) {
			const [message = '', ...diffs] = entry.split(ChangeLog.diffRegex)
			for (const diff of diffs) {
				const [, from, to] = diff.match(/^diff --git a\/(.+)\/package\.json b\/(.+)\/package\.json/) ?? []
				if (from && to) {
					if (from !== to) {
						renames.set(from, to)
					}
					const directory = current(to)
					history.set(directory, [...history.get(directory) ?? [], { message, output: message + diff }])
				}
			}
		}
		return history
	}

	private static of(p: Package, commits: ReadonlyArray<{ readonly message: string, readonly output: string }>) {
		const releases = new Array<Release>()
		let lastRelease: Release | undefined
		for (const [index, { message, output }] of commits.entries()) {
			const commit = Commit.parse(message)
			if (!output.includes('version')) {
				continue
			}
			// eslint-disable-next-line prefer-const
			let { version, oldVersion } = output.match(ChangeLog.versionRegex)?.groups ?? {}
			if (index === commits.length - 1) {
				version ||= releases.filter(release => !!release.oldVersion).at(-1)?.oldVersion || output.match(ChangeLog.initialVersionRegex)?.groups?.version || version
			}
			const release = !version || !commit.date ? lastRelease : (lastRelease = new Release(p, version, oldVersion, commit.date))
			release?.commits.push(commit)
			if (release && !releases.includes(release)) {
				releases.push(release)
			}
		}
		return releases.map(release => release.toString()).filter(text => !!text.trim()).join('\n\n')
	}
}