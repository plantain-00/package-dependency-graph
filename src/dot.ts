export function toDotFile(dependencies: { [name: string]: string[] }) {
  const nodes = new Set<string>()
  const maps: string[] = []
  for (const dependency in dependencies) {
    nodes.add(dependency)
    const name = toName(dependency)
    for (const dependent of dependencies[dependency]) {
      nodes.add(dependent)
      maps.push(`  ${name} -> ${toName(dependent)}`)
    }
  }
  const nodeExpression = Array.from(nodes).map((n) => `  ${toName(n)}[label = "${n}"]`)

  return `digraph {
${maps.join('\n')}

${nodeExpression.join('\n')}
}`
}

function toName(dependency: string) {
  return dependency.replace(/-/g, '_').replace(/\//g, '_').replace(/@/g, '_')
}
