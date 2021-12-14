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
  includeDevDependencies: boolean
  includePeerDependencies: boolean
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
    const dependencies: string[] = []
    const targets: { [name: string]: string }[] = []
    if (p.dependencies) {
      targets.push(p.dependencies)
    }
    if (p.devDependencies && options?.includeDevDependencies) {
      targets.push(p.devDependencies)
    }
    if (p.peerDependencies && options?.includePeerDependencies) {
      targets.push(p.peerDependencies)
    }
    for (const target of targets) {
      let workpaceDependencies = Object.keys(target)
      if (options?.excludeNodeModules) {
        workpaceDependencies = workpaceDependencies.filter((d) => packageNames.has(d))
      }
      if (workpaceDependencies.length > 0) {
        dependencies.push(...workpaceDependencies)
      }
    }
    return {
      name: p.name,
      path: flattenedWorkspacesArray[i],
      dependencies: dependencies.length > 0 ? dependencies : undefined,
      version: p.version,
    }
  })
}


/**
 * @public
 */
export function readWorkspaceDependencies(options?: Partial<{
  targetPath: string
  excludeNodeModules: boolean
  includeDevDependencies: boolean
  includePeerDependencies: boolean
}>): Workspace[] {
  const rootPackageJson: PackageJson = JSON.parse((fs.readFileSync(path.resolve((options?.targetPath || process.cwd()), 'package.json'))).toString())
  const workspacesArray = rootPackageJson.workspaces.map((w) => glob.sync(w))
  const flattenedWorkspaces = new Set<string>()
  workspacesArray.forEach((workspace) => {
    workspace.forEach((w) => {
      flattenedWorkspaces.add(w)
    })
  })
  const flattenedWorkspacesArray: string[] = []
  for (const workspace of flattenedWorkspaces) {
    const stats = statSync(path.resolve(workspace))
    if (stats && stats.isDirectory()) {
      const packageJsonStats = statSync(path.resolve(workspace, 'package.json'))
      if (packageJsonStats && packageJsonStats.isFile()) {
        flattenedWorkspacesArray.push(workspace)
      }
    }
  }
  const packageJsons: PackageJson[] = []
  const packageNames = new Set<string>()
  for (const workspace of flattenedWorkspacesArray) {
    const packageJson: PackageJson = JSON.parse((fs.readFileSync(path.resolve(workspace, 'package.json'))).toString())
    packageJsons.push(packageJson)
    packageNames.add(packageJson.name)
  }

  return packageJsons.map((p, i) => {
    const dependencies: string[] = []
    const targets: { [name: string]: string }[] = []
    if (p.dependencies) {
      targets.push(p.dependencies)
    }
    if (p.devDependencies && options?.includeDevDependencies) {
      targets.push(p.devDependencies)
    }
    if (p.peerDependencies && options?.includePeerDependencies) {
      targets.push(p.peerDependencies)
    }
    for (const target of targets) {
      let workpaceDependencies = Object.keys(target)
      if (options?.excludeNodeModules) {
        workpaceDependencies = workpaceDependencies.filter((d) => packageNames.has(d))
      }
      if (workpaceDependencies.length > 0) {
        dependencies.push(...workpaceDependencies)
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
  devDependencies?: { [name: string]: string }
  peerDependencies?: { [name: string]: string }
  workspaces: string[]
}

/**
 * @public
 */
export interface Workspace {
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

function statSync(p: string) {
  try {
    return fs.statSync(p)
  } catch {
    return undefined
  }
}
