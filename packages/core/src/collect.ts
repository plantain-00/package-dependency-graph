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
  const workspaceDependencies = await readWorkspaceDependenciesAsync<{ packageDependencyGraph?: { group?: string } }>({
    targetPath,
    excludeNodeModules,
    includeDevDependencies,
    includePeerDependencies,
  })
  const dependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } } = {}
  for (const workspace of workspaceDependencies) {
    if (workspace.packageJson.packageDependencyGraph?.group) {
      dependencies[workspace.name] = {
        dependencies: workspace.dependencies || [],
        group: workspace.packageJson.packageDependencyGraph.group,
      }
    } else {
      dependencies[workspace.name] = workspace.dependencies || []
    }
  }
  return dependencies
}
