import { Colors } from "."

export function standardizeInput(
  colors: Colors,
  rawDependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } },
  rawNestedGroups: NestedGroupInput[] = [],
) {
  const dependencies: { [name: string]: string[] } = {}
  const nestedGroups = rawNestedGroups.map((g) => standardizeNestedGroup(colors, g))
  for (const dependencyName in rawDependencies) {
    const dependency = rawDependencies[dependencyName]
    if (Array.isArray(dependency)) {
      dependencies[dependencyName] = dependency
    } else {
      dependencies[dependencyName] = dependency.dependencies
      let nestedGroup: NestedGroup | undefined = nestedGroups.find((n) => n.name === dependency.group)
      for (const g of iterateNestedGroups(nestedGroups)) {
        if (g.name === dependency.group) {
          nestedGroup = g
          break
        }
      }
      if (nestedGroup) {
        nestedGroup.children.push(dependencyName)
      } else {
        nestedGroups.push({
          name: dependency.group,
          color: colors.getNext(),
          children: [dependencyName],
        })
      }
    }
  }
  return {
    dependencies,
    nestedGroups,
    flattenedGroups: Object.fromEntries(Array.from(iterateNestedGroups(nestedGroups)).map((n) => [n.name, n])),
    packageGroups: Array.from(iteratePackageGroups(nestedGroups)),
  }
}

export interface NestedGroup {
  name: string
  color: string
  children: (NestedGroup | string)[]
}

export interface NestedGroupInput {
  name: string
  children: (NestedGroupInput | string)[]
}

function* iterateNestedGroup(nestedGroup: NestedGroup): Generator<NestedGroup, void, unknown> {
  yield nestedGroup
  for (const child of nestedGroup.children) {
    if (typeof child !== 'string') {
      yield* iterateNestedGroup(child)
    }
  }
}

function* iterateNestedGroups(nestedGroups: NestedGroup[]): Generator<NestedGroup, void, unknown> {
  for (const nestedGroup of nestedGroups) {
    yield* iterateNestedGroup(nestedGroup)
  }
}

function* iteratePackageGroup(nestedGroup: NestedGroup, groups: string[]): Generator<PackageGroup, void, unknown> {
  for (const child of nestedGroup.children) {
    if (typeof child !== 'string') {
      yield* iteratePackageGroup(child, [...groups, child.name])
    } else {
      yield {
        name: child,
        groups,
      }
    }
  }
}

function* iteratePackageGroups(nestedGroups: NestedGroup[]): Generator<PackageGroup, void, unknown> {
  for (const nestedGroup of nestedGroups) {
    yield* iteratePackageGroup(nestedGroup, [nestedGroup.name])
  }
}

interface PackageGroup {
  name: string
  groups: string[]
}

export function getCommonParentGroup(from: PackageGroup | undefined, to: PackageGroup | undefined) {
  if (from && to) {
    let i = 0
    for (; i < from.groups.length && to.groups.length; i++) {
      if (from.groups[i] !== to.groups[i]) {
        return {
          fromGroup: from.groups[i],
          toGroup: to.groups[i],
        }
      }
    }
    return {
      fromGroup: from.groups[i],
      toGroup: to.groups[i],
    }
  }
  return {
    fromGroup: from?.groups?.[0],
    toGroup: to?.groups?.[0],
  }
}

function standardizeNestedGroup(
  colors: Colors,
  rawNestedGroup: NestedGroupInput,
): NestedGroup {
  return {
    name: rawNestedGroup.name,
    color: colors.getNext(),
    children: rawNestedGroup.children.map((c) => typeof c === 'string' ? c : standardizeNestedGroup(colors, c))
  }
}
