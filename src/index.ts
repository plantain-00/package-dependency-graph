import minimist from 'minimist'
import * as fs from 'fs'
import * as util from 'util'

import { collectDependencies } from './collect'
import { toDotFile } from './dot'

import * as packageJson from '../package.json'

let suppressError = false

function showToolVersion() {
  console.log(`Version: ${packageJson.version}`)
}

const writeFileAsync = util.promisify(fs.writeFile)

async function executeCommandLine() {
  const argv = minimist(process.argv.slice(2), { '--': true })

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
  const dot = toDotFile(dependencies)
  if (argv.dot && typeof argv.dot === 'string') {
    await writeFileAsync(argv.dot, dot)
  } else if (argv.debug) {
    console.info(dot)
  }
}

executeCommandLine().then(() => {
  console.log(`package-dependency-graph success.`)
}, error => {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log(error)
  }
  if (!suppressError) {
    process.exit(1)
  }
})
