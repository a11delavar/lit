import { Package } from './Packages.ts'
import * as FileSystem from 'fs'

export class Readme {
	static generate() {
		const getPackageReadme = (pkg: Package) => {
			const style = 'for-the-badge'
			const packageNameEncoded = encodeURIComponent(pkg.name)
			const packageNameEncodedAndDashEscaped = encodeURIComponent(pkg.name).replace(/-/g, '--')

			const packageFolderBadge = `[${pkg.folderName}](${pkg.relativePath})`
			const packageBadge = `[![](https://img.shields.io/badge/${packageNameEncodedAndDashEscaped}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](https://www.npmjs.com/package/${pkg.name})`
			const packageVersionBadge = `[![](https://img.shields.io/npm/v/${packageNameEncoded}?style=${style}&label=)](https://www.npmjs.com/package/${pkg.name})`
			const packageDownloadsBadge = `[![](https://img.shields.io/npm/dm/${packageNameEncoded}?style=${style}&label=&color=blue)](https://www.npmjs.com/package/${pkg.name})`

			return `| ${packageFolderBadge} | ${packageBadge} | ${packageVersionBadge} | ${packageDownloadsBadge} |`
		}

		const readme = `
			<div align="center">
			<h3>Libraries</h3>

			[![Tests](https://img.shields.io/github/actions/workflow/status/a11delavar/lit/qa.yml?logo=github&style=for-the-badge&label=Tests)](https://a11delavar.github.io/lit/actions/workflows/qa.yml)


			| Module  | Package | Version | Downloads |
			| ------- | ------- | ------- | --------- |
			${Package.all.map(pkg => getPackageReadme(pkg)).join('\n')}

			</div>
		`

		const readmeLinesWithoutTabs = readme.split('\n')
			.map(line => line.replace(/\t/g, ''))
			.join('\n')

		FileSystem.writeFileSync('README.md', readmeLinesWithoutTabs)
	}
}