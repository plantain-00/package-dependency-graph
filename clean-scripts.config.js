const { checkGitStatus } = require('clean-scripts')

const tsFiles = `"src/**/*.ts" "spec/**/*.ts"`
const jsFiles = `"*.config.js"`

module.exports = {
  build: [
    'rimraf dist/',
    'tsc -p src/',
    'node dist/index.js --dot spec/result.dot --png spec/dagre-result.png --debug --check --supressError > spec/result.txt'
  ],
  lint: {
    ts: `tslint ${tsFiles}`,
    js: `standard ${jsFiles}`,
    export: `no-unused-export "src/**/*.ts" --strict --need-module tslib --ignore-module fs --ignore-module path --ignore-module util`,
    commit: `commitlint --from=HEAD~1`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p src --strict'
  },
  test: [
    'tsc -p spec',
    'jasmine',
    'clean-release --config clean-run.config.js',
    () => checkGitStatus()
  ],
  fix: {
    ts: `tslint --fix ${tsFiles}`,
    js: `standard --fix ${jsFiles}`
  }
}
