import * as dagre from 'dagre'
import { createCanvas } from 'canvas'

/**
 * @public
 */
export function renderToCanvas(graph: dagre.graphlib.Graph, fontSize: number, margin: number) {
  const canvas = createCanvas(300, 300)
  const ctx = canvas.getContext('2d')
  for (const node of graph.nodes()) {
    const nodeValue = graph.node(node)
    ctx.textBaseline = 'middle'
    ctx.font = `${fontSize}px sans-serif`
    const textMetrics = ctx.measureText(node)
    nodeValue.width = textMetrics.width + margin * 2
    nodeValue.height = fontSize + margin * 2
  }
  dagre.layout(graph as unknown as dagre.graphlib.Graph)
  const label = (graph as unknown as { _label: { width: number, height: number } })._label
  const canvasWidth = label.width + margin * 2
  const canvasHeight = label.height + margin * 2
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  for (const node of graph.nodes()) {
    const nodeValue: NodeValue = graph.node(node)
    ctx.save()
    if (nodeValue.color) {
      ctx.strokeStyle = nodeValue.color
    }
    ctx.beginPath()
    ctx.strokeRect(nodeValue.x - nodeValue.width / 2 + margin, nodeValue.y - nodeValue.height / 2 + margin, nodeValue.width, nodeValue.height)
    ctx.stroke()

    ctx.fillStyle = 'black'
    ctx.textBaseline = 'middle'
    ctx.font = `${fontSize}px sans-serif`
    const textMetrics = ctx.measureText(node)
    ctx.fillText(node, nodeValue.x - textMetrics.width / 2 + margin, nodeValue.y + margin)
    ctx.restore()
  }
  for (const edge of graph.edges()) {
    const edgeValue: GraphEdgeValue = graph.edge(edge)
    ctx.save()
    if (edgeValue.color) {
      ctx.strokeStyle = edgeValue.color
    }
    ctx.beginPath()
    for (let i = 0; i < edgeValue.points.length; i++) {
      const point = edgeValue.points[i]
      if (i === 0) {
        ctx.moveTo(point.x + margin, point.y + margin)
      } else {
        ctx.lineTo(point.x + margin, point.y + margin)
      }
    }
    ctx.stroke()
    ctx.restore()
  }
  return canvas
}

interface NodeValue extends dagre.Node {
  color?: string
}

interface GraphEdgeValue extends dagre.GraphEdge {
  color?: string
}
