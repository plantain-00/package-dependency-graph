import * as dagre from 'dagre-cluster-fix'

import { Colors, getCommonParentGroup, NestedGroup, NestedGroupInput, standardizeInput } from '.'

/**
 * @public
 */
export function toDagre(
  rawDependencies: { [name: string]: (string[]) | { dependencies: string[], group: string } },
  rawNestedGroups: NestedGroupInput[] = [],
) {
  const nodes = new Map<string, string>()
  const edges: { dependency: string, dependent: string, color: string }[] = []

  const colors = new Colors(2)

  const { dependencies, nestedGroups, flattenedGroups, packageGroups } = standardizeInput(colors, rawDependencies, rawNestedGroups)
  const graph = new dagre.graphlib.Graph({
    compound: nestedGroups.length > 0,
  })
  graph.setGraph({})

  const mapData: { from: string, to: string }[] = []
  for (const dependency in dependencies) {
    if (!nodes.has(dependency)) {
      nodes.set(dependency, colors.getNext())
    }
    const dependents = dependencies[dependency]
    for (const dependent of dependents) {
      let color = nodes.get(dependent)
      if (!color) {
        color = colors.getNext()
        nodes.set(dependent, color)
      }
      const { fromGroup, toGroup } = getCommonParentGroup(
        packageGroups.find((p) => p.name === dependency),
        packageGroups.find((p) => p.name === dependent),
      )
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
            color: toGroup ? flattenedGroups[toGroup].color : color,
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
  for (const group of nestedGroups) {
    nestedGroupToSubgraph(graph, group)
  }
  for (const edge of edges) {
    graph.setEdge(edge.dependency, edge.dependent, { color: edge.color })
  }

  return graph
}

function nestedGroupToSubgraph(graph: dagre.graphlib.Graph, nestedGroup: NestedGroup) {
  graph.setNode(nestedGroup.name, { label: nestedGroup.name, color: nestedGroup.color })
  for (const child of nestedGroup.children) {
    if (typeof child !== 'string') {
      graph.setParent(child.name, nestedGroup.name)
      nestedGroupToSubgraph(graph, child)
    } else {
      graph.setParent(child, nestedGroup.name)
    }
  }
}
