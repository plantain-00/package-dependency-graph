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
  for (const edge of graph.edges()) {
    const edgeValue: GraphEdgeValue = graph.edge(edge)
    children.push(target.polyline(edgeValue.points.map((p) => ({ x: p.x + margin, y: p.y + margin })), edgeValue.color!))
    const point1 = edgeValue.points[edgeValue.points.length - 2]
    const point2 = edgeValue.points[edgeValue.points.length - 1]
    const alpha = Math.atan((point2.x - point1.x) / (point1.y - point2.y))
    const deltaAlpha = Math.PI / 12
    const arrowSize = 10
    const alpha1 = alpha - deltaAlpha
    const alpha2 = alpha + deltaAlpha
    children.push(target.polygon([
      {
        x: point2.x + margin,
        y: point2.y + margin
      },
      {
        x: point2.x + arrowSize * Math.sin(alpha1) + margin,
        y: point2.y - arrowSize * Math.cos(alpha1) + margin
      },
      {
        x: point2.x + arrowSize * Math.sin(alpha2) + margin,
        y: point2.y - arrowSize * Math.cos(alpha2) + margin
      }
    ], edgeValue.color!))
  }
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
  return target.getResult(children, canvasWidth, canvasHeight)
}

interface NodeValue extends dagre.Node {
  color?: string
}

interface GraphEdgeValue extends dagre.GraphEdge {
  color?: string
}
