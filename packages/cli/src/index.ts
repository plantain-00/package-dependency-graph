import minimist from 'minimist'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import { createCanvas } from 'canvas'
import { renderGraphFromSource } from 'graphviz-cli'

import { collectDependencies, toDotFile, checkDependencies, getTopLevelPackages, toDagre } from 'package-dependency-graph-core'
import { renderDagreToCanvas } from 'dagre-canvas'
import { renderDagreToSvg } from 'dagre-svg'

import * as packageJson from '../package.json'
import { Configuration } from './config'

let suppressError: boolean | undefined = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

function showHelp() {
  console.log(`Version ${packageJson.version}
Syntax:   package-dependency-graph [options]
Examples: package-dependency-graph --config ./package-dependency-graph.config.js
          package-dependency-graph --config ./package-dependency-graph.config.ts
          package-dependency-graph --graphviz --png foo.png
          package-dependency-graph --graphviz --svg foo.svg
          package-dependency-graph --png foo.png
          package-dependency-graph --svg foo.svg
Options:
 -h, --help                                         Print this message.
 -v, --version                                      Print the version
 --config                                           Config file
 --root                                             Tell the CLI the root directory of project
 --dot                                              Save the dot file
 --png                                              Save the png file
 --svg                                              Save the svg file
 --exclude-node_modules                             Exclude packages from node_modules
 --include-dev-dependencies                         Include devDependencies packages
 --include-peer-dependencies                        Include peerDependencies packages
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
    config?: string
    root?: string
    ['exclude-node_modules']?: boolean
    ['include-dev-dependencies']?: boolean
    ['include-peer-dependencies']?: boolean
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

  let configData: Configuration & { default?: Configuration } | undefined
  if (argv.config) {
    const configFilePath = path.resolve(process.cwd(), argv.config)
    if (configFilePath.endsWith('.ts')) {
      require('ts-node/register/transpile-only')
    }
  
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    configData = require(configFilePath)
    if (configData?.default) {
      configData = configData.default;
    }
  }

  suppressError = argv.suppressError

  const dependencies = await collectDependencies(
    argv.root || configData?.root || '.',
    argv['exclude-node_modules'] ?? configData?.excludeNodeModules,
    undefined,
    argv['include-dev-dependencies'] ?? configData?.includeDevDependencies,
    argv['include-peer-dependencies'] ?? configData?.includePeerDependencies,
  )
  const debug = argv.debug || configData?.debug
  if (debug) {
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

  const nestedGroups = configData?.nestedGroups?.(Object.keys(dependencies))
  const dotFile = toDotFile(dependencies, nestedGroups)
  const dot = argv.dot || configData?.dot
  if (dot && typeof dot === 'string') {
    await writeFileAsync(dot, dotFile)
  } else if (debug) {
    console.info(dotFile)
  }
  const graphviz = argv.graphviz || configData?.graphviz
  const png = argv.png || configData?.png
  if (png && typeof png === 'string') {
    if (graphviz) {
      await renderGraphFromSource({ input: dotFile }, { format: 'png', engine: 'dot', name: png })
    } else {
      const graph = toDagre(dependencies, nestedGroups)
      const canvas = createCanvas(300, 300)
      renderDagreToCanvas(graph, canvas as unknown as HTMLCanvasElement, 12, 10)
      await writeFileAsync(png, canvas.toBuffer('image/png'))
    }
  }
  const svg = argv.svg || configData?.svg
  if (svg && typeof svg === 'string') {
    let svgString: string
    if (graphviz) {
      svgString = await renderGraphFromSource({ input: dotFile }, { format: 'svg', engine: 'dot' })
    } else {
      const graph = toDagre(dependencies, nestedGroups)
      svgString = renderDagreToSvg(graph, 12, 10)
    }
    await writeFileAsync(svg, svgString)
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
