import * as dagre from 'dagre-cluster-fix'

import { Colors } from '.'

/**
 * @public
 */
export function toDagre(dependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } }) {
  const graph = new dagre.graphlib.Graph({
    compound: Object.values(dependencies).some((d) => !Array.isArray(d)),
  })
  graph.setGraph({})
  const nodes = new Map<string, string>()
  const edges: { dependency: string, dependent: string, color: string }[] = []

  const colors = new Colors(2)

  const groups: Record<string, { items: string[], color: string }> = {}
  const packageGroups: Record<string, string> = {}
  for (const dependency in dependencies) {
    const dependents = dependencies[dependency]
    if (!Array.isArray(dependents)) {
      if (!groups[dependents.group]) {
        groups[dependents.group] = {
          items: [],
          color: colors.getNext(),
        }
      }
      groups[dependents.group].items.push(dependency)
      packageGroups[dependency] = dependents.group
    }
  }

  const mapData: { from: string, to: string }[] = []
  for (const dependency in dependencies) {
    if (!nodes.has(dependency)) {
      nodes.set(dependency, colors.getNext())
    }
    const dependents = dependencies[dependency]
    for (const dependent of Array.isArray(dependents) ? dependents : dependents.dependencies) {
      let color = nodes.get(dependent)
      if (!color) {
        color = colors.getNext()
        nodes.set(dependent, color)
      }
      const fromGroup = packageGroups[dependency]
      const toGroup = packageGroups[dependent]
      if (fromGroup !== toGroup) {
        const newMapData = {
          from: fromGroup || dependency,
          to: toGroup || dependent,
        }
        if (mapData.every((m) => m.from !== newMapData.from || m.to !== newMapData.to)) {
          mapData.push(newMapData)
          edges.push({
            dependency: newMapData.from,
            dependent: newMapData.to,
            color: toGroup ? groups[toGroup].color : color,
          })
        }
      } else {
        edges.push({ dependency, dependent, color })
      }
    }
  }
  for (const [n, color] of nodes) {
    graph.setNode(n, { label: n, color })
  }
  for (const groupName in groups) {
    const group = groups[groupName]
    graph.setNode(groupName, { label: groupName, color: group.color })
    for (const item of group.items) {
      graph.setParent(item, groupName)
    }
  }
  for (const edge of edges) {
    graph.setEdge(edge.dependency, edge.dependent, { color: edge.color })
  }

  return graph
}
