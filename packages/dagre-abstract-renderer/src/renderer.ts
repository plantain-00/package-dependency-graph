import * as dagre from 'dagre-cluster-fix'

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

  let offsetX = 0
  let offsetY = 0
  for (const edge of graph.edges()) {
    const edgeValue = graph.edge(edge);
    for (const point of edgeValue.points) {
      if (point.x < offsetX) {
        offsetX = point.x
      }
      if (point.y < offsetY) {
        offsetY = point.y
      }
    }
  }
  const marginX = margin - offsetX
  const marginY = margin - offsetY
  const canvasWidth = label.width! + margin + marginX
  const canvasHeight = label.height! + margin + marginY
  
  target.init(canvasWidth, canvasHeight)
  const children: T[] = []
  for (const edge of graph.edges()) {
    const edgeValue: GraphEdgeValue = graph.edge(edge)
    const edgeColor = edgeValue.color!
    const points = edgeValue.points.map((p) => ({ x: p.x + marginX, y: p.y + marginY }))

    const point1 = points[points.length - 2]
    const point2 = points[points.length - 1]
    const arrowSize = 10
    const deltaAlpha = Math.PI / 8
    const alpha = Math.atan((point2.x - point1.x) / (point1.y - point2.y))
    const alpha1 = alpha - deltaAlpha
    const alpha2 = alpha + deltaAlpha
    const arrow1 = {
      x: point2.x + arrowSize * Math.sin(alpha1),
      y: point2.y - arrowSize * Math.cos(alpha1)
    }
    const arrow2 = {
      x: point2.x + arrowSize * Math.sin(alpha2),
      y: point2.y - arrowSize * Math.cos(alpha2)
    }
    points[points.length - 1] = {
      x: (arrow1.x + arrow2.x) / 2,
      y: (arrow1.y + arrow2.y) / 2,
    }

    if (points.length === 3) {
      children.push(target.quadraticCurveTo(points[0], points[1], points[2], edgeColor))
    } else if (points.length === 4) {
      children.push(target.bezierCurveTo(points[0], points[1], points[2], points[3], edgeColor))
    } else if (points.length === 5) {
      children.push(target.quadraticCurveTo(points[0], points[1], points[2], edgeColor))
      children.push(target.quadraticCurveTo(points[2], points[3], points[4], edgeColor))
    } else if (points.length > 6) {
      children.push(target.quadraticCurveTo(points[0], points[1], points[2], edgeColor))
      children.push(target.polyline(points.slice(2, points.length - 2), edgeColor))
      children.push(target.quadraticCurveTo(points[points.length - 3], points[points.length - 2], points[points.length - 1], edgeColor))
    } else {
      children.push(target.polyline(points, edgeColor))
    }

    children.push(target.polygon([
      point2,
      arrow1,
      arrow2,
    ], edgeColor))
  }
  for (const node of graph.nodes()) {
    const nodeValue: NodeValue = graph.node(node)
    children.push(target.createNode(
      () => [],
      () => [
        target.strokeRect(nodeValue.x - nodeValue.width / 2 + marginX, nodeValue.y - nodeValue.height / 2 + marginY, nodeValue.width, nodeValue.height, nodeValue.color!),
        target.fillText(node, nodeValue.x + marginX, nodeValue.y - nodeValue.height / 2 + marginY + 16, 'black', fontSize, 'sans-serif')
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
