/**
 * @public
 */
export interface RenderTarget<T> {
  measureText: (text: string, fontSize: number, fontFamily: string) => number
  getResult(children: T[], width: number, height: number): T
  init(width: number, height: number): void
  createNode(attributesAction: () => T[], childrenAction: () => T[], nodeName?: string): T
  strokeRect(x: number, y: number, width: number, height: number, color: string): T
  fillText(text: string, x: number, y: number, color: string, fontSize: number, fontFamily: string): T
  polyline(points: Point[], color: string): T
  polygon(points: Point[], color: string): T
  quadraticCurveTo(p0: Point, p1: Point, p2: Point, color: string): T
  bezierCurveTo(p0: Point, p1: Point, p2: Point, p3: Point, color: string): T
}

/**
 * @public
 */
export interface Point {
  x: number
  y: number
}
