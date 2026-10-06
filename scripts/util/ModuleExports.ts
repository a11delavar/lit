import ts from 'typescript'
import FileSystem from 'fs'
import Path from 'path'

export type ExportKind = 'class' | 'function' | 'enum' | 'const' | 'variable' | 'namespace' | 'interface' | 'type'

export interface ModuleExport {
	readonly name: string
	readonly kind: ExportKind
	readonly typeOnly: boolean
	readonly description?: string
}

const kindOrder: Array<ExportKind> = ['class', 'function', 'enum', 'const', 'variable', 'namespace', 'interface', 'type']

/**
 * The named exports of a module and of every relative module it re-exports, read syntactically, so that no program has
 * to be built. What a module re-exports from another package, such as everything `@a11d/lit` re-exports of `lit`, is
 * not its own and is left out.
 */
export class ModuleExports {
	static of(path: string) {
		return [...new ModuleExports().collect(Path.resolve(path)).values()]
			.sort((a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind))
	}

	/** The source file of a relative module specifier, which names the emitted `.js` file. */
	static resolve(from: string, specifier: string) {
		if (!specifier.startsWith('.')) {
			return undefined
		}
		const base = Path.resolve(Path.dirname(from), specifier)
		return [base.replace(/\.js$/, '.ts'), base, `${base}.ts`, Path.join(base, 'index.ts')]
			.find(candidate => FileSystem.existsSync(candidate) && FileSystem.statSync(candidate).isFile())
	}

	private readonly visited = new Map<string, Map<string, ModuleExport>>()

	private collect(path: string): Map<string, ModuleExport> {
		const cached = this.visited.get(path)
		if (cached) {
			return cached
		}
		const exports = new Map<string, ModuleExport>()
		this.visited.set(path, exports)

		const sourceFile = ts.createSourceFile(path, FileSystem.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true)
		const local = localDeclarations(sourceFile)
		const add = (entry: ModuleExport) => exports.set(entry.name, merge(exports.get(entry.name), entry))

		for (const statement of sourceFile.statements) {
			if (ts.isExportDeclaration(statement)) {
				const target = !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)
					? undefined
					: ModuleExports.resolve(path, statement.moduleSpecifier.text)
				const targetExports = target ? this.collect(target) : undefined
				const clause = statement.exportClause
				if (!clause) {
					for (const entry of targetExports?.values() ?? []) {
						add(statement.isTypeOnly ? { ...entry, typeOnly: true } : entry)
					}
				} else if (ts.isNamespaceExport(clause)) {
					add({ name: clause.name.text, kind: 'namespace', typeOnly: statement.isTypeOnly })
				} else {
					for (const element of clause.elements) {
						const originalName = (element.propertyName ?? element.name).text
						const original = statement.moduleSpecifier ? targetExports?.get(originalName) : local.get(originalName)
						if (original || !statement.moduleSpecifier) {
							const typeOnly = statement.isTypeOnly || element.isTypeOnly || !!original?.typeOnly
							add({ name: element.name.text, kind: original?.kind ?? 'const', typeOnly, description: original?.description })
						}
					}
				}
			} else if (isExported(statement)) {
				for (const name of declaredNames(statement)) {
					const entry = local.get(name)
					if (entry) {
						add(entry)
					}
				}
			}
		}
		return exports
	}
}

function merge(existing: ModuleExport | undefined, entry: ModuleExport): ModuleExport {
	return !existing ? entry : {
		name: entry.name,
		kind: kindOrder.indexOf(entry.kind) < kindOrder.indexOf(existing.kind) ? entry.kind : existing.kind,
		typeOnly: existing.typeOnly && entry.typeOnly,
		description: existing.description ?? entry.description,
	}
}

function isExported(statement: ts.Statement) {
	const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined
	return !!modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
		&& !modifiers.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)
}

function declaredNames(statement: ts.Statement) {
	const name = (statement as ts.DeclarationStatement).name
	return ts.isVariableStatement(statement)
		? statement.declarationList.declarations.flatMap(declaration => ts.isIdentifier(declaration.name) ? [declaration.name.text] : [])
		: name && ts.isIdentifier(name) ? [name.text] : []
}

/** Every top-level declaration of a file by name, exported or not, as `export { x }` may refer to either. */
function localDeclarations(sourceFile: ts.SourceFile) {
	const declarations = new Map<string, ModuleExport>()
	const add = (name: string, kind: ExportKind, node: ts.Node) => declarations.set(name, merge(declarations.get(name), {
		name,
		kind,
		typeOnly: kind === 'interface' || kind === 'type',
		description: descriptionOf(node),
	}))
	for (const statement of sourceFile.statements) {
		if (ts.isClassDeclaration(statement) && statement.name) {
			add(statement.name.text, 'class', statement)
		} else if (ts.isFunctionDeclaration(statement) && statement.name) {
			add(statement.name.text, 'function', statement)
		} else if (ts.isEnumDeclaration(statement)) {
			add(statement.name.text, 'enum', statement)
		} else if (ts.isInterfaceDeclaration(statement)) {
			add(statement.name.text, 'interface', statement)
		} else if (ts.isTypeAliasDeclaration(statement)) {
			add(statement.name.text, 'type', statement)
		} else if (ts.isModuleDeclaration(statement) && ts.isIdentifier(statement.name)) {
			add(statement.name.text, 'namespace', statement)
		} else if (ts.isVariableStatement(statement)) {
			const kind = statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'variable'
			for (const declaration of statement.declarationList.declarations) {
				if (ts.isIdentifier(declaration.name)) {
					add(declaration.name.text, kind, declaration)
				}
			}
		}
	}
	return declarations
}

function descriptionOf(node: ts.Node) {
	return ts.getJSDocCommentsAndTags(node)
		.filter(ts.isJSDoc)
		.map(jsDoc => ts.getTextOfJSDocComment(jsDoc.comment)?.trim())
		.find(Boolean) || undefined
}
