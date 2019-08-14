import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'

const readFileAsync = util.promisify(fs.readFile)
const readdirAsync = util.promisify(fs.readdir)

/**
 * @public
 */
export async function collectDependencies(targetPath: string, excludeNodeModules = false) {
  const dirPath = path.resolve(targetPath, 'packages')
  const packages = await readdirAsync(dirPath)
  const dependencies: { [name: string]: string[] } = {}
  for (const packageName of packages) {
    const packagePath = path.resolve(dirPath, packageName)
    const packageStats = await statAsync(packagePath)
    if (packageStats && packageStats.isDirectory()) {
      const packageJsonPath = path.resolve(packagePath, 'package.json')
      const packageJsonStats = await statAsync(packageJsonPath)
      if (packageJsonStats && packageJsonStats.isFile()) {
        const packageJsonBuffer = await readFileAsync(packageJsonPath)
        const packageJson: {
          name: string
          dependencies: { [name: string]: string }
        } = JSON.parse(packageJsonBuffer.toString())
        if (packageJson.dependencies) {
          dependencies[packageJson.name] = Object.keys(packageJson.dependencies)
        } else {
          dependencies[packageJson.name] = []
        }
      }
    }
  }
  if (excludeNodeModules) {
    const validPackageNames = new Set(Object.keys(dependencies))
    for (const dependency in dependencies) {
      dependencies[dependency] = dependencies[dependency].filter((d) => validPackageNames.has(d))
    }
  }
  return dependencies
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
