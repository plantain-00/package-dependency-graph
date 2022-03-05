/**
 * @public
 */
export function checkDependencies(dependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } }): { [name: string]: Set<string> } {
  const result: { [name: string]: Set<string> } = {}
  const lagecy = convertDependencies(dependencies)
  for (const packageName in lagecy) {
    for (const dependency of lagecy[packageName]) {
      checkUnnecessaryDependencies(packageName, dependency, result, lagecy)
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
export function getTopLevelPackages(dependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } }): string[] {
  const lagecy = convertDependencies(dependencies)
  const values = Object.values(lagecy)
  const result: string[] = []
  for (const name in lagecy) {
    if (values.every((v) => v.every((a) => a !== name))) {
      result.push(name)
    }
  }
  return result
}

function convertDependencies(dependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } }) {
  const result: Record<string, string[]> = {}
  for (const name in dependencies) {
    const dependency = dependencies[name]
    if (Array.isArray(dependency)) {
      result.name = dependency
    } else {
      result.name = dependency.dependencies
    }
  }
  return result
}
