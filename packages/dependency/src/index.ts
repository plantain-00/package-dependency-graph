import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import glob from 'glob'

const readFileAsync = util.promisify(fs.readFile)
const globAsync = util.promisify(glob)

/**
 * @public
 */
export async function readWorkspaceDependenciesAsync(options?: Partial<{
  targetPath: string
  excludeNodeModules: boolean
}>): Promise<Workspace[]> {
  const rootPackageJson: PackageJson = JSON.parse((await readFileAsync(path.resolve((options?.targetPath || process.cwd()), 'package.json'))).toString())
  const workspacesArray = await Promise.all(rootPackageJson.workspaces.map((w) => globAsync(w)))
  const flattenedWorkspaces = new Set<string>()
  workspacesArray.forEach((workspace) => {
    workspace.forEach((w) => {
      flattenedWorkspaces.add(w)
    })
  })
  const flattenedWorkspacesArray: string[] = []
  for (const workspace of flattenedWorkspaces) {
    const stats = await statAsync(path.resolve(workspace))
    if (stats && stats.isDirectory()) {
      const packageJsonStats = await statAsync(path.resolve(workspace, 'package.json'))
      if (packageJsonStats && packageJsonStats.isFile()) {
        flattenedWorkspacesArray.push(workspace)
      }
    }
  }
  const packageJsons: PackageJson[] = []
  const packageNames = new Set<string>()
  for (const workspace of flattenedWorkspacesArray) {
    const packageJson: PackageJson = JSON.parse((await readFileAsync(path.resolve(workspace, 'package.json'))).toString())
    packageJsons.push(packageJson)
    packageNames.add(packageJson.name)
  }

  return packageJsons.map((p, i) => {
    let dependencies: string[] | undefined
    if (p.dependencies) {
      let workpaceDependencies = Object.keys(p.dependencies)
      if (options?.excludeNodeModules) {
        workpaceDependencies = workpaceDependencies.filter((d) => packageNames.has(d))
      }
      if (workpaceDependencies.length > 0) {
        dependencies = workpaceDependencies
      }
    }
    return {
      name: p.name,
      path: flattenedWorkspacesArray[i],
      dependencies,
      version: p.version,
    }
  })
}

interface PackageJson {
  name: string
  version: string
  dependencies?: { [name: string]: string }
  workspaces: string[]
}

interface Workspace {
  name: string;
  path: string;
  dependencies?: string[]
  version: string
}

function statAsync(p: string) {
  return new Promise<fs.Stats | undefined>((resolve) => {
    fs.stat(p, (err, stats) => {
      if (err) {
        resolve(undefined)
      } else {
        resolve(stats)
      }
    })
  })
}
