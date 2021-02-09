import * as dagre from 'dagre'
import { RenderTarget, renderDagre, Point } from 'dagre-abstract-renderer'

/**
 * @public
 */
export function renderDagreToSvg(graph: dagre.graphlib.Graph, fontSize: number, margin: number) {
  return renderDagre(graph, new SvgTarget(), fontSize, margin)
}

/**
 * @public
 */
export class SvgTarget implements RenderTarget<string> {
  measureText(text: string, fontSize: number) {
    return text.length * fontSize * 0.618
  }
  getResult(children: string[], width: number, height: number) {
    return `<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${width} ${height}"
  color-interpolation-filters="sRGB"
>
${children.join('')}
</svg>`
  }
  init(width: number, height: number) {
    // do nothing
  }
  createNode(attributesAction: () => string[], childrenAction: () => string[], nodeName?: string) {
    const attributes = attributesAction()
    const children = childrenAction()
    if (!nodeName) {
      nodeName = 'g'
    }
    return `<${nodeName} ${attributes.join(' ')}>
      ${children.join('')}
    </${nodeName}>`
  }
  strokeRect(x: number, y: number, width: number, height: number, color: string) {
    return `<rect
    x="${x}"
    y="${y}"
    width="${width}"
    height="${height}"
    stroke="${color}"
    fill="none"
  />`
  }
  fillText(text: string, x: number, y: number, color: string, fontSize: number, fontFamily: string) {
    return `<text text-anchor="middle"
    x="${x}"
    y="${y}"
    fill="${color}"
    dominant-baseline="middle"
    style="font-size:${fontSize}px;font-family:${fontFamily}"
  >${text}
  </text>`
  }
  polyline(points: Point[], color: string) {
    const pointsText = points.map((p) => `${p.x},${p.y}`).join(' ')
    return `<polyline
    points="${pointsText}"
    stroke="${color}"
    fill="none"
  />`
  }
  polygon(points: Point[], color: string) {
    const pointsText = points.map((p) => `${p.x},${p.y}`).join(' ')
    return `<polygon
    points="${pointsText}"
    stroke="none"
    fill="${color}"
  />`
  }
  quadraticCurveTo(p0: Point, p1: Point, p2: Point, color: string) {
    return `<path
    d="M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}"
    stroke="${color}"
    fill="none"
  />`
  }
  bezierCurveTo(p0: Point, p1: Point, p2: Point, p3: Point, color: string) {
    return `<path
    d="M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}"
    stroke="${color}"
    fill="none"
  />`
  }
}
