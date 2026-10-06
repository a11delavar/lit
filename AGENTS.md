# AGENTS.md

A guide for coding agents working in this repository: how it is organized, how to write and verify code here, and the traps that have already cost time. The rules below are true of the code as it is.

## The repository

- A monorepo of small TypeScript libraries published to npm as `@a11d/<name>`. The main one is `@a11d/lit` (`packages/Lit`), a thin layer over Lit: the `Component` base class, `ComponentPart`, `Controller`, `ElementRef`/`ElementRefs`, and the `bind`, `style`, `event`, `eventListener`, `updated`, `query`, `property` and `state` decorators and directives. The others are the utilities it is built on and a test fixture.
- `@a11d/lit` re-exports `lit`, replacing `html` and some decorators with its own. Import from `@a11d/lit`, or from the module inside the package, never from `lit` directly.

| Stack | Notes |
| --- | --- |
| TypeScript 5 and the native preview side by side | `tsgo` (`@typescript/native-preview`) type-checks; `typescript` builds the packages for publishing and serves typescript-eslint. `experimentalDecorators` and `useDefineForClassFields: false` are required. |
| Vitest 5 browser mode on Playwright | Specs run in real Chromium and Firefox. |
| Node 26 | Scripts are `.ts` files run by node's type stripping. |

## Repository map

| Path | What it is |
| --- | --- |
| `packages/<Name>/` | One npm package each. Source and its `*.test.ts` side by side; `@a11d/lit` has one directory per feature, each with a `README.md`. |
| `packages/tsconfig.json` | Type-checks the specs, which the packages exclude from their builds. Never emitted. |
| `scripts/` | `bump.ts`, `release.ts`, `changelog.ts`, `readme.ts`, `docs-build.ts`, `clean.ts`, `vitest-setup.ts`, helpers in `util/`. Type-checked by `scripts/tsconfig.json`. |
| `vitest.config.ts` | Browser instances `chromium` and `firefox`, packages aliased to their source. |
| `.github/workflows/` | `qa.yml` type-checks, lints, checks the READMEs and tests, on every PR (`pull-request.yml`) and push to main. `development.yml` then publishes pending versions and deploys the documentation site. |

Generated files, never edited by hand:

- The root `README.md`, and in each package README the sections between `<!-- features -->` and `<!-- exports -->` markers and their closing markers: `npm run readme`. Committed, and CI fails when they are out of date. The feature list comes from each feature README's heading and first sentence, in the order `index.ts` exports the directories; the exports table from `index.ts` and the first sentence of each export's JSDoc. Change those instead.
- `packages/*/CHANGELOG.md`: `npm run changelog`, from git history. Gitignored, and shipped in every package.
- `docs-dist/`: `npm run docs:build`, the documentation site on GitHub Pages: every README and changelog as Markdown under `docs/`, plus `llms.txt` and `llms-full.txt`. Gitignored.
- `dist/` and `*.tsbuildinfo`: compiler output and incremental cache.

## Commands

| Command | Use |
| --- | --- |
| `npx vitest run --project chromium packages/<Name>/<File>.test.ts` | The spec you are writing. `-t '<name>'` narrows to tests. |
| `npx vitest run --project firefox packages/<Name>` | The same in Firefox, before calling a change done. |
| `npm run dev` | Vitest watch mode, Chromium only. |
| `npm test` | The whole suite in both browsers, under a minute. |
| `npm run typescript` | `tsgo --build --noEmit` over packages and scripts, then `tsgo -p packages/tsconfig.json` over the specs. |
| `npx eslint <files>` | Lint what you touched; `npm run lint` lints everything. |
| `npm run readme` | Regenerates the root README and the generated sections of every package's. |
| `npm run changelog` | Writes every package's `CHANGELOG.md`. |
| `npm run docs:build` | Writes the documentation site into `docs-dist`. |
| `npm run bump -- <@a11d/name or Directory>... <patch\|minor\|major\|prerelease>` | Bumps versions without tagging and updates the lockfile. `premajor`, `preminor` and `prepatch` work too; prereleases are `-preview.<n>`. |
| `npm run release -- --dry-run` | Lists the versions a release would publish, in publish order, and packages whose shipped files changed since their published version. Reads npm and git only. |

- Do not run `npm run release` without `--dry-run`: CI publishes.
- `npm run typescript` starts with `npm run clean`, which deletes every `dist/`. A package in `node_modules` then resolves to its `index.ts`.

## Packages

A package directory holds:

- `package.json`: `name` (`@a11d/<kebab-name>`), `version`, `description`, `repository` (`url` plus `directory: packages/<Name>`), `bugs`, `keywords`, `author`, `license: "MIT"`, `homepage` (the package's GitHub tree), `type: module`, `main`, `types`, `files: ["dist", "CHANGELOG.md"]`. `@a11d/lit` also ships `*/README.md`, its feature READMEs. A package that must be loaded once next to the consumer's own copy, like `@a11d/lit` for `@a11d/lit-testing`, is a peer dependency.
- `tsconfig.json`: extends `../../tsconfig.base.json`, `outDir: ./dist`, excludes `./dist` and `**/*.test.ts`.
- `index.ts`: `export * from './X.js'` per module; relative imports carry `.js`.
- `README.md`: written by hand, with the generated sections above.

A new package also needs a reference in the root `tsconfig.json`, `npm install` to link the workspace, and `npm run readme`.

## Writing code

- Less code wins. Prefer reusing Lit's own primitives over new machinery, count the lines a change adds against those it removes, and fix root causes in the base class rather than in subclasses.
- Keep the surface minimal: no option or public member without a second consumer. Search the consumers before adding or removing one, and report every technically breaking removal.
- The imperative path is the core, and a directive is a convenience over it, never the only way in. Controllers take options in the factory form, `new X(host, host => ({ get y() { return host.y } }))`.
- Memoize a directive into a field, as Lit identifies directives by their class. Directive class members are public, or the anonymous class in the `.d.ts` fails with TS4094.
- `@a11d/lit` also renders on the server: `index.ts` stubs `window`, `document`, `navigator` and `location`, and browser-only work is guarded.

## Specs

- Specs are `*.test.ts` next to the source, using Vitest globals (`describe`, `it`, `expect`, `vi`). Components are created with `ComponentTestFixture` from `@a11d/lit-testing`, inside the `describe` block that uses them.
- Every spec file runs in a page of its own. Import every module whose side effects the spec relies on, such as `./index.js` of `@a11d/equals`, which installs the prototype methods; another file's import no longer leaks in.
- Mocks are restored before every test (`restoreMocks`), so a spy installed in `beforeAll` is gone by the first test: install it in `beforeEach`. `vi.fn(implementation)` survives the restore, `vi.fn().mockImplementation(…)` does not.
- `vi.spyOn` calls through; stub with `.mockImplementation(() => {})` or `.mockReturnValue(…)`.
- Hooks run in the order they were registered (`sequence.hooks: 'list'`). The fixture registers its `beforeEach` when constructed, so a hook declared before it runs before the component exists. A function returned from a hook is its teardown.
- Specs are type-checked: write the `override` modifiers, definite assignments and `.js` extensions the packages need.

## Code style

- Tabs, LF, a final newline in every file (`.editorconfig`, and `eol-last` in lint). Single quotes, no semicolons, no `public` keyword, `import { type X }` for types, no `console`, no duplicate imports.
- Comments: a JSDoc header on what renders in the docs, and one line inside code only where a reader would otherwise undo it. No narration.
- Scripts run through node's type stripping, which rejects TypeScript that is not erasable: no parameter properties, enums or namespaces. They import each other with `.ts` extensions.

## Commits, changelogs and releases

- Conventional commits: `feat(Lit): Add the ElementRef class`. The scope is the package's directory name exactly, and must be a single word, as the changelog parser reads `\w+`. The subject is capitalized, code in backticks, `!` marks a breaking change (`refactor(KeyPath)!: …`). Types: `feat`, `fix`, `chore`, `refactor`, `perf`, `test`, `docs`, `infra`.
- One commit may carry changes of several packages: every line of its message in the form `type(Scope): Heading` is a change of its own.
- The changelog reads the first-parent history for commits that change `packages/<Name>/package.json`, including renames of the directory, and keeps their changes whose scope equals `<Name>`. A change without a version bump in the same commit, or with another scope, has no entry.
- A version is bumped in the commit that makes the change, with `npm run bump`.
- Every push to main publishes, through the `Release` job of `development.yml`: every package whose version npm does not have yet, bases first, prereleases under the `preview` tag. It builds with `typescript`, writes the changelogs into the packages so that the tarballs ship them, and refuses anything but a clean checkout of main at `origin/main`. It tags and commits nothing, and a rerun skips what is published, so a failed release is finished by running it again.
- Publishing uses npm trusted publishing: npm trusts `development.yml` in the GitHub environment `npm`, so there is no token. `npm trust` only accepts packages that exist on npm, so a new package is published once by hand, then trusted with `npm trust github <@a11d/name> --file development.yml --repo a11delavar/lit --env npm --allow-publish`. Renaming the workflow or the environment breaks every trust rule.

## Verification before calling work done

| Change | Checks |
| --- | --- |
| Source | Its specs in Chromium, then Firefox; the specs of dependent packages if the change reaches them; `npm run typescript`; eslint on the changed files. |
| Specs only | The affected spec files; `npm run typescript`. |
| JSDoc of an export, a feature README's first paragraph, `index.ts` | `npm run readme`, and commit the result. |
| `package.json` | `npm run release -- --dry-run`. |
| Before handing over a branch | `npm test` once. |