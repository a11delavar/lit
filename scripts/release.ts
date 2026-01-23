import { Arguments, Package } from './util/index.ts'

const packageName = Arguments.tryGet(0, 'No package provided')
const versionBumpType = Arguments.tryGet(1, 'No version bump type provided')

await Package.byName(packageName).release(versionBumpType)