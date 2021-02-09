import * as dagre from 'dagre'
import { RenderTarget, renderDagre, Point } from 'dagre-abstract-renderer'

/**
 * @public
 */
export function renderDagreToCanvas(graph: dagre.graphlib.Graph, canvas: HTMLCanvasElement, fontSize: number, margin: number) {
  renderDagre(graph, new CanvasTarget(canvas), fontSize, margin)
}

/**
 * @public
 */
export class CanvasTarget implements RenderTarget<void> {
  public ctx: CanvasRenderingContext2D
  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }
  measureText(text: string, fontSize: number, fontFamily: string) {
    this.ctx.textBaseline = 'middle'
    this.ctx.font = `${fontSize}px ${fontFamily}`
    const textMetrics = this.ctx.measureText(text)
    return textMetrics.width
  }
  getResult() {
    // do nothing
  }
  init(width: number, height: number) {
    this.canvas.width = width
    this.canvas.height = height
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(0, 0, width, height)
  }
  createNode(attributesAction: () => void, childrenAction: () => void) {
    this.ctx.save()
    attributesAction()
    childrenAction()
    this.ctx.restore()
  }
  strokeRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    this.ctx.strokeRect(x, y, width, height)
    this.ctx.stroke()
  }
  fillText(text: string, x: number, y: number, color: string, fontSize: number, fontFamily: string) {
    this.ctx.fillStyle = color
    this.ctx.textBaseline = 'middle'
    this.ctx.font = `${fontSize}px ${fontFamily}`
    const textMetrics = this.ctx.measureText(text)
    this.ctx.fillText(text, x - textMetrics.width / 2, y)
  }
  polyline(points: Point[], color: string) {
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y)
      } else {
        this.ctx.lineTo(point.x, point.y)
      }
    }
    this.ctx.stroke()
  }
  polygon(points: Point[], color: string) {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y)
      } else {
        this.ctx.lineTo(point.x, point.y)
      }
    }
    this.ctx.fill()
  }
  quadraticCurveTo(p0: Point, p1: Point, p2: Point, color: string) {
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(p0.x, p0.y)
    this.ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
    this.ctx.stroke()
  }
  bezierCurveTo(p0: Point, p1: Point, p2: Point, p3: Point, color: string) {
    this.ctx.strokeStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(p0.x, p0.y)
    this.ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
    this.ctx.stroke()
  }
}
