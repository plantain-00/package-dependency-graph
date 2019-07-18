const { checkGitStatus } = require('clean-scripts')

const tsFiles = `"packages/**/src/**/*.ts" "spec/**/*.ts"`
const jsFiles = `"*.config.js"`

module.exports = {
  build: [
    'rimraf packages/core/dist/',
    'tsc -p packages/core/src/',
    'rimraf packages/cli/dist/',
    'tsc -p packages/cli/src/',
    'node packages/cli/dist/index.js --dot spec/result.dot --png spec/dagre-result.png --svg spec/dagre-result.svg --debug --supressError > spec/result.txt'
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export ${tsFiles} --strict --need-module tslib`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverageCore: 'type-coverage -p packages/core/src --strict',
    typeCoverageCli: 'type-coverage -p packages/cli/src --strict'
  },
  test: [
    'tsc -p spec',
    'jasmine',
    () => checkGitStatus()
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  }
}
