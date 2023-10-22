import { Packages } from './Packages.mjs'
import * as FileSystem from 'fs'

export class Readme {
	static generate() {
		const packageNames = Packages.getAllPackages()

		const getPackageReadme = (packageName) => {
			const style = 'for-the-badge'
			const relativePath = Packages.getPath(packageName).split('\\').slice(-3, -1).join('/')
			const moduleName = relativePath.split('/').slice(-1)[0]
			const packageNameEncoded = encodeURIComponent(packageName)
			const packageNameEncodedAndDashEscaped = encodeURIComponent(packageName).replace(/-/g, '--')

			const packageFolderBadge = `[${moduleName}](${relativePath})`
			const packageBadge = `[![](https://img.shields.io/badge/${packageNameEncodedAndDashEscaped}-8A2BE2?style=${style}&logo=npm&logoColor=red&color=white)](https://www.npmjs.com/package/${packageName})`
			const packageVersionBadge = `[![](https://img.shields.io/npm/v/${packageNameEncoded}?style=${style}&label=)](https://www.npmjs.com/package/${packageName})`
			const packageDownloadsBadge = `[![](https://img.shields.io/npm/dm/${packageNameEncoded}?style=${style}&label=&color=blue)](https://www.npmjs.com/package/${packageName})`

			return `| ${packageFolderBadge} | ${packageBadge} | ${packageVersionBadge} | ${packageDownloadsBadge} |`
		}

		const readme = `
			<div align="center">
			<h3>Libraries</h3>

			[![Tests](https://img.shields.io/github/actions/workflow/status/a11delavar/lit/development.yml?logo=github&style=for-the-badge&label=Tests)](https://a11delavar.github.io/lit/actions/workflows/development.yml)


			| Module  | Package | Version | Downloads |
			| ------- | ------- | ------- | --------- |
			${packageNames.map(packageName => getPackageReadme(packageName)).join('\n')}

			</div>
		`

		const readmeLinesWithoutTabs = readme.split('\n')
			.map(line => line.replace(/\t/g, ''))
			.join('\n')

		FileSystem.writeFileSync('README.md', readmeLinesWithoutTabs)
	}
}