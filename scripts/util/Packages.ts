import * as FileSystem from 'fs'
import process from 'process'
import Path from 'path'
import { run } from './run.ts'

export class Package {
	static readonly directory = './packages'

	static readonly all = getPackagePathsByDirectory(Package.directory).map(path => new Package(path))

	static byName(name: string) {
		const pkg = Package.all.find(p => p.name === name)
		if (!pkg) {
			throw new Error(`Could not find package ${name}`)
		}
		return pkg
	}

	readonly path: string
	readonly relativePath: string
	readonly packageJsonPath: string
	readonly name: string
	readonly folderName: string
	readonly packageJson: { readonly name: string }

	constructor(path: string) {
		this.path = path
		this.relativePath = Path.relative(process.cwd(), path).replace(/\\/g, '/')
		this.packageJsonPath = Path.resolve(path, 'package.json').replace(/\\/g, '/')
		this.packageJson = JSON.parse(FileSystem.readFileSync(this.packageJsonPath, 'utf8'))
		this.name = this.packageJson.name
		this.folderName = Path.basename(path)
	}

	async release(versionBumpType: string) {
		const isPreRelease = versionBumpType.startsWith('pre')
		await run('npm run clean')
		await run('tsc', { directory: this.relativePath })
		await run('npx copyfiles "README.md" "*/README.md" dist', { directory: this.relativePath })
		await run(`npm version --loglevel=error ${versionBumpType.replace('prepatch', 'prerelease')} ${!isPreRelease ? '' : '--preid=preview'}`, { directory: this.relativePath })
		await run(`npm publish --loglevel=error --access public --tag ${isPreRelease ? 'preview' : 'latest'}`, { directory: this.relativePath })
		await run('npm run clean')
	}

	static async releaseAll() {
		for (const pkg of Package.all) {
			try {
				await pkg.release('patch')
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(error)
			}
		}
	}
}

/** Recursively searches a directory for package.json files */
function getPackagePathsByDirectory(directory: string): Array<string> {
	const files = FileSystem.readdirSync(directory)
	return files.flatMap(file => {
		const fullPath = Path.resolve(directory, file)
		if (FileSystem.statSync(fullPath)?.isDirectory()) {
			return getPackagePathsByDirectory(fullPath)
		}

		if (fullPath.endsWith('package.json') && !fullPath.includes('node_modules')) {
			return Path.dirname(fullPath)
		}
	}).filter(Boolean) as Array<string>
}