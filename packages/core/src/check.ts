/**
 * @public
 */
export function checkDependencies(dependencies: { [name: string]: string[] }) {
  const result: { [name: string]: Set<string> } = {}
  for (const packageName in dependencies) {
    for (const dependency of dependencies[packageName]) {
      checkUnnecessaryDependencies(packageName, dependency, result, dependencies)
    }
  }
  return result
}

function checkUnnecessaryDependencies(
  packageName: string,
  dependencyName: string,
  result: { [name: string]: Set<string> },
  dependencies: { [name: string]: string[] }
) {
  if (dependencies[packageName] && dependencies[dependencyName]) {
    for (const dependency of dependencies[dependencyName]) {
      if (dependencies[packageName].includes(dependency)) {
        if (!result[packageName]) {
          result[packageName] = new Set()
        }
        result[packageName].add(dependency)
      }
      if (dependency !== packageName) {
        checkUnnecessaryDependencies(packageName, dependency, result, dependencies)
      }
    }
  }
}

/**
 * @public
 */
export function getTopLevelPackages(dependencies: { [name: string]: string[] }) {
  const values = Object.values(dependencies)
  const result: string[] = []
  for (const name in dependencies) {
    if (values.every((v) => v.every((a) => a !== name))) {
      result.push(name)
    }
  }
  return result
}
