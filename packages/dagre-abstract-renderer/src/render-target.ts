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
  polyline(points: { x: number; y: number; }[], color: string): T
}
