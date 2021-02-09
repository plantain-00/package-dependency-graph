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
    const edgeColor = edgeValue.color!
    const points = edgeValue.points.map((p) => ({ x: p.x + margin, y: p.y + margin }))
    if (points.length === 3) {
      children.push(target.quadraticCurveTo(points[0], points[1], points[2], edgeColor))
    } else if (points.length === 4) {
      children.push(target.bezierCurveTo(points[0], points[1], points[2], points[3], edgeColor))
    } else if (points.length === 5) {
      children.push(target.quadraticCurveTo(points[0], points[1], points[2], edgeColor))
      children.push(target.quadraticCurveTo(points[2], points[3], points[4], edgeColor))
    } else {
      children.push(target.polyline(points, edgeColor))
    }
    let point1 = edgeValue.points[edgeValue.points.length - 2]
    const point2 = edgeValue.points[edgeValue.points.length - 1]
    const arrowSize = 10
    const deltaAlpha = Math.PI / 8
    if (edgeValue.points.length >= 3) {
      const point0 = edgeValue.points[edgeValue.points.length - 3]
      const rate = arrowSize / Math.sqrt(Math.pow(point0.x - point2.x, 2) + Math.pow(point0.y - point2.y, 2))
      const remainRate = 1 - rate
      point1 = {
        x: Math.pow(remainRate, 2) * point2.x + 2 * rate * remainRate * point1.x + Math.pow(rate, 2) * point0.x,
        y: Math.pow(remainRate, 2) * point2.y + 2 * rate * remainRate * point1.y + Math.pow(rate, 2) * point0.y,
      }
    }
    const alpha = Math.atan((point2.x - point1.x) / (point1.y - point2.y))
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
    ], edgeColor))
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
