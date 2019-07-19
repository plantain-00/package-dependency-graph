import minimist from 'minimist'
import * as fs from 'fs'
import * as util from 'util'
import * as dagre from 'dagre'
import { createCanvas } from 'canvas'

import { collectDependencies, toDotFile, checkDependencies, getTopLevelPackages, toDagre } from 'package-dependency-graph-core'
import { renderDagreToCanvas } from 'dagre-canvas'
import { renderDagreToSvg } from 'dagre-svg'

import * as packageJson from '../package.json'

let suppressError: boolean | undefined = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

const writeFileAsync = util.promisify(fs.writeFile)

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true }) as unknown as {
    v?: boolean
    version?: boolean
    suppressError?: boolean
    root?: string
    ['exclude-node_modules']?: boolean
    debug?: boolean
    check?: boolean
    dot?: unknown
    png?: unknown
    svg?: unknown
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  suppressError = argv.suppressError

  const dependencies = await collectDependencies(argv.root || '.', argv['exclude-node_modules'])
  if (argv.debug) {
    console.info(dependencies)
  }

  if (argv.check) {
    const result = checkDependencies(dependencies)
    if (Object.keys(result).length > 0) {
      console.info(result)
      throw new Error('There are unnecessary dependencies.')
    } else {
      console.info(getTopLevelPackages(dependencies))
    }
  }

  const dot = toDotFile(dependencies)
  if (argv.dot && typeof argv.dot === 'string') {
    await writeFileAsync(argv.dot, dot)
  } else if (argv.debug) {
    console.info(dot)
  }
  if (argv.png && typeof argv.png === 'string') {
    const graph = toDagre(dependencies)
    const canvas = createCanvas(300, 300)
    renderDagreToCanvas(graph as unknown as dagre.graphlib.Graph, canvas as unknown as HTMLCanvasElement, 12, 10)
    await writeFileAsync(argv.png, canvas.toBuffer('image/png'))
  }
  if (argv.svg && typeof argv.svg === 'string') {
    const graph = toDagre(dependencies)
    const svg = renderDagreToSvg(graph as unknown as dagre.graphlib.Graph, 12, 10)
    await writeFileAsync(argv.svg, svg)
  }
}

executeCommandLine().then(() => {
  console.log(`package-dependency-graph success.`)
}, (error: Error) => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  if (!suppressError) {
    process.exit(1)
  }
})
