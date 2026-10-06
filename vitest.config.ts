import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const packagesPath = resolve(import.meta.dirname, 'packages')

// Every package resolves to its source rather than to the "main" it publishes, which points at a dist that is absent until a build runs.
const alias = Object.fromEntries(readdirSync(packagesPath).flatMap(directory => {
	const manifest = resolve(packagesPath, directory, 'package.json')
	const entry = resolve(packagesPath, directory, 'index.ts')
	return !existsSync(manifest) || !existsSync(entry) ? [] : [[JSON.parse(readFileSync(manifest, 'utf8')).name, entry]]
}))

export default defineConfig({
	resolve: { alias },
	test: {
		globals: true,
		include: ['packages/**/*.test.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],
		setupFiles: ['./scripts/vitest-setup.ts'],
		// A later beforeEach may rely on an earlier one having built its fixture, so hooks of the same kind run in the order they were registered.
		sequence: { hooks: 'list' },
		// Every spec gets its spies back the way it found them.
		restoreMocks: true,
		browser: {
			enabled: true,
			headless: true,
			viewport: { width: 1280, height: 800 },
			provider: playwright(),
			// Named explicitly, so that `--project chromium` selects one of them.
			instances: [
				{ browser: 'chromium', name: 'chromium' },
				{ browser: 'firefox', name: 'firefox' },
			],
		},
	},
})
