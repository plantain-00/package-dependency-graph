import minimist from 'minimist'
import * as fs from 'fs'
import * as util from 'util'
import { createCanvas } from 'canvas'
import { renderGraphFromSource } from 'graphviz-cli'

import { collectDependencies, toDotFile, checkDependencies, getTopLevelPackages, toDagre } from 'package-dependency-graph-core'
import { renderDagreToCanvas } from 'dagre-canvas'
import { renderDagreToSvg } from 'dagre-svg'

import * as packageJson from '../package.json'

let suppressError: boolean | undefined = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   package-dependency-graph [options]
Examples: package-dependency-graph --graphviz --png foo.png
          package-dependency-graph --graphviz --svg foo.svg
          package-dependency-graph --png foo.png
          package-dependency-graph --svg foo.svg
Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 --root                                             Tell the CLI the root directory of project
 --dot                                              Save the dot file
 --png                                              Save the png file
 --svg                                              Save the svg file
 --exclude-node_modules                             Exclude packages from node_modules
 --check                                            Check unnecessary dependencies(not recommended)
 --debug                                            Show debug info
 --graphviz                                         Save graphviz styled png or svg file
`)
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
    h?: unknown
    help?: unknown
    graphviz?: unknown
  }

  const showVersion = argv.v || argv.version
  if (showVersion) {
    showToolVersion()
    return
  }

  if (argv.h || argv.help) {
    showHelp()
    process.exit(0)
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
    if (argv.graphviz) {
      await renderGraphFromSource({ input: dot }, { format: 'png', engine: 'dot', name: argv.png })
    } else {
      const graph = toDagre(dependencies)
      const canvas = createCanvas(300, 300)
      renderDagreToCanvas(graph, canvas as unknown as HTMLCanvasElement, 12, 10)
      await writeFileAsync(argv.png, canvas.toBuffer('image/png'))
    }
  }
  if (argv.svg && typeof argv.svg === 'string') {
    let svg: string
    if (argv.graphviz) {
      svg = await renderGraphFromSource({ input: dot }, { format: 'svg', engine: 'dot' })
    } else {
      const graph = toDagre(dependencies)
      svg = renderDagreToSvg(graph, 12, 10)
    }
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
