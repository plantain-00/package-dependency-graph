import * as dagre from 'dagre'

import { RenderTarget } from '.'

/**
 * @public
 */
export function renderDagre<T>(graph: dagre.graphlib.Graph, target: RenderTarget<T>, fontSize: number, margin: number) {
  for (const node of graph.nodes()) {
    const nodeValue = graph.node(node)
    nodeValue.width = target.measureText(node, fontSize, 'sans-serif') + margin * 2
    nodeValue.height = fontSize + margin * 2
  }
  dagre.layout(graph)
  const label = graph.graph()
  const canvasWidth = label.width! + margin * 2
  const canvasHeight = label.height! + margin * 2
  target.init(canvasWidth, canvasHeight)
  const children: T[] = []
  for (const node of graph.nodes()) {
    const nodeValue: NodeValue = graph.node(node)
    children.push(target.createNode(
      () => [],
      () => [
        target.strokeRect(nodeValue.x - nodeValue.width / 2 + margin, nodeValue.y - nodeValue.height / 2 + margin, nodeValue.width, nodeValue.height, nodeValue.color!),
        target.fillText(node, nodeValue.x + margin, nodeValue.y + margin, 'black', fontSize, 'sans-serif')
      ]
    ))
  }
  for (const edge of graph.edges()) {
    const edgeValue: GraphEdgeValue = graph.edge(edge)
    children.push(target.polyline(edgeValue.points.map((p) => ({ x: p.x + margin, y: p.y + margin })), edgeValue.color!))
  }
  return target.getResult(children, canvasWidth, canvasHeight)
}

interface NodeValue extends dagre.Node {
  color?: string
}

interface GraphEdgeValue extends dagre.GraphEdge {
  color?: string
}
