import { readWorkspaceDependenciesAsync } from 'package-dependency-collect'

/**
 * @public
 */
export async function collectDependencies(targetPath: string, excludeNodeModules = false, _workspaces = ['packages']) {
  const workspaceDependencies = await readWorkspaceDependenciesAsync({
    targetPath,
    excludeNodeModules,
  })
  const dependencies: { [name: string]: string[] } = {}
  for (const workspace of workspaceDependencies) {
    dependencies[workspace.name] = workspace.dependencies || []
  }
  return dependencies
}
