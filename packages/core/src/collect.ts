import { readWorkspaceDependenciesAsync } from 'package-dependency-collect'

/**
 * @public
 */
export async function collectDependencies(
  targetPath: string,
  excludeNodeModules = false,
  _workspaces = ['packages'],
  includeDevDependencies = false,
  includePeerDependencies = false,
) {
  const workspaceDependencies = await readWorkspaceDependenciesAsync({
    targetPath,
    excludeNodeModules,
    includeDevDependencies,
    includePeerDependencies,
  })
  const dependencies: { [name: string]: string[] } = {}
  for (const workspace of workspaceDependencies) {
    dependencies[workspace.name] = workspace.dependencies || []
  }
  return dependencies
}
