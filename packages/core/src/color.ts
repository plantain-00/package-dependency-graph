export class Colors {
  private colors: string[] = []
  private index = 0
  constructor(n: number) {
    for (let i = 0; i <= n; i++) {
      const r = Math.floor(i * 255.0 / n)
      for (let j = 0; j <= n; j++) {
        const g = Math.floor(j * 255.0 / n)
        for (let k = 0; k <= n; k++) {
          const b = Math.floor(k * 255.0 / n)
          if ((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2 > 20000) {
            this.colors.push(`#${formatColor(r)}${formatColor(g)}${formatColor(b)}`)
          }
        }
      }
    }
  }
  getNext() {
    const color = this.colors[this.index]
    this.index++
    if (this.index >= this.colors.length) {
      this.index = 0
    }
    return color
  }
}

function formatColor(c: number) {
  const result = c.toString(16)
  return result.length === 1 ? '0' + result : result
}
