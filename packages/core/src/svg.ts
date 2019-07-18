import * as dagre from 'dagre'

/**
 * @public
 */
export function renderToSvg(graph: dagre.graphlib.Graph, fontSize: number, margin: number) {
  let childrenText = ''
  for (const node of graph.nodes()) {
    const nodeValue = graph.node(node)
    nodeValue.width = node.length * fontSize * 0.618 + margin * 2
    nodeValue.height = fontSize + margin * 2
  }
  dagre.layout(graph)
  const label = (graph as unknown as { _label: { width: number, height: number } })._label
  const canvasWidth = label.width + margin * 2
  const canvasHeight = label.height + margin * 2
  for (const node of graph.nodes()) {
    const nodeValue: NodeValue = graph.node(node)
    childrenText += `<g>
      <rect
        x="${nodeValue.x - nodeValue.width / 2 + margin}"
        y="${nodeValue.y - nodeValue.height / 2 + margin}"
        width="${nodeValue.width}"
        height="${nodeValue.height}"
        stroke="${nodeValue.color}"
        fill="none"
      />
      <text text-anchor="middle"
        x="${nodeValue.x + margin}"
        y="${nodeValue.y + margin}"
        fill="black"
        dominant-baseline="middle"
        style="font-size:${fontSize}px;font-family:sans-serif"
      >${node}
      </text>
    </g>`
  }
  for (const edge of graph.edges()) {
    const edgeValue: GraphEdgeValue = graph.edge(edge)
    const points = edgeValue.points.map((p) => `${p.x + margin},${p.y + margin}`).join(' ')
    childrenText += `<g>
      <polyline
        points="${points}"
        stroke="${edgeValue.color}"
        fill="none"
      />
    </g>`
  }
  return `<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${canvasWidth} ${canvasHeight}"
  color-interpolation-filters="sRGB"
>
${childrenText}
</svg>`

}

interface NodeValue extends dagre.Node {
  color?: string
}

interface GraphEdgeValue extends dagre.GraphEdge {
  color?: string
}
