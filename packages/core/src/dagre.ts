import * as dagre from 'dagre'

import { Colors } from '.'

/**
 * @public
 */
export function toDagre(dependencies: { [name: string]: string[] }) {
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({})
  const nodes = new Map<string, string>()
  const edges: { dependency: string, dependent: string, color: string }[] = []

  const colors = new Colors(2)

  for (const dependency in dependencies) {
    if (!nodes.has(dependency)) {
      nodes.set(dependency, colors.getNext())
    }
    for (const dependent of dependencies[dependency]) {
      let color = nodes.get(dependent)
      if (!color) {
        color = colors.getNext()
        nodes.set(dependent, color)
      }
      edges.push({ dependency, dependent, color })
    }
  }
  for (const [n, color] of nodes) {
    graph.setNode(n, { label: n, color })
  }
  for (const edge of edges) {
    graph.setEdge(edge.dependency, edge.dependent, { color: edge.color })
  }

  return graph
}
