import FileSystem from 'fs'
import Path from 'path'
import { ChangeLog, LlmsText } from './util/index.ts'

// Writes the documentation site into "docs-dist": every README and changelog as Markdown, "llms.txt" and "llms-full.txt".
const directory = 'docs-dist'

await ChangeLog.generate()
await FileSystem.promises.rm(directory, { recursive: true, force: true })
for (const [path, content] of LlmsText.files()) {
	const target = Path.join(directory, path)
	await FileSystem.promises.mkdir(Path.dirname(target), { recursive: true })
	await FileSystem.promises.writeFile(target, `${content}\n`)
}
